import { UPLOAD_FINALIZE_NUDGE_AFTER_MS, UPLOAD_MAX_CONSECUTIVE_RETRIES } from "@/constants/constants";
import { buildFingerprint } from "@/utils/upload";

import { FAILURE_MESSAGES, NOTICES } from "./failures";
import { FakeUploadServer } from "./fakeUploadServer";
import { StoredUpload, UploadStorage } from "./storage";
import { UploadApiError } from "./transport";
import { UploadEvent, UploadSnapshot } from "./types";
import { UploadManager, UploadManagerDeps } from "./uploadManager";

const BYTES = Array.from({ length: 22 }, (_, index) => (index * 7 + 3) % 251);
const makeFile = (name = "talk.mp4", lastModified = 1000) =>
  new File([new Uint8Array(BYTES)], name, { type: "video/mp4", lastModified });

// Resolves on the next macrotask (or when aborted) so loops that wait yield to the test instead of spinning.
const fakeSleep = jest.fn(
  (_ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 0);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    })
);

const memoryStorage = (initial: StoredUpload | null = null) => {
  const state = { record: initial };
  const storage: UploadStorage = {
    load: () => state.record,
    save: (record) => {
      state.record = record;
    },
    clear: () => {
      state.record = null;
    },
  };
  return { state, storage };
};

const setup = (server: FakeUploadServer, overrides: Partial<UploadManagerDeps> = {}, stored: StoredUpload | null = null) => {
  const snapshots: UploadSnapshot[] = [];
  const events: UploadEvent[] = [];
  const store = memoryStorage(stored);
  const manager = new UploadManager({
    api: server,
    storage: store.storage,
    onChange: (snapshot) => snapshots.push(snapshot),
    onEvent: (event) => events.push(event),
    checksum: async () => "sha256 AAAA",
    sleep: fakeSleep,
    random: () => 0,
    network: { isOnline: () => true, waitForOnline: async () => undefined },
    ...overrides,
  });
  return { manager, snapshots, events, store };
};

const storedFor = (file: File, sessionId: string, confirmedBytes = 8): StoredUpload => ({
  sessionId,
  fingerprint: buildFingerprint(file),
  confirmedBytes,
  updatedAt: 1,
});

const waitUntil = async (condition: () => boolean) => {
  for (let attempt = 0; attempt < 200 && !condition(); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  expect(condition()).toBe(true);
};

describe("UploadManager", () => {
  let server: FakeUploadServer;

  beforeEach(() => {
    fakeSleep.mockClear();
    server = new FakeUploadServer(4);
  });

  describe("uploading", () => {
    it("should upload every byte in chunks and complete after finalization", async () => {
      const { manager, events, store } = setup(server);

      await manager.start(makeFile());

      expect(server.committed).toEqual(BYTES);
      expect(server.sentOffsets).toEqual([0, 4, 8, 12, 16, 20]);
      expect(manager.getSnapshot()).toMatchObject({ phase: "completed", videoAssetId: 42, percent: 100 });
      expect(store.state.record).toBeNull();
      expect(events.map((event) => event.type)).toEqual(["started", "completed"]);
      expect(events[0]).toEqual({ type: "started", resumed: false, sizeBytes: BYTES.length });
    });

    it("should report progress from confirmed bytes and withhold the asset until finalization is done", async () => {
      server.pollsUntilComplete = 3;
      const { manager, snapshots } = setup(server);

      await manager.start(makeFile());

      const uploading = snapshots.filter((snapshot) => snapshot.phase === "uploading").map((snapshot) => snapshot.confirmedBytes);
      expect(uploading).toEqual(expect.arrayContaining([4, 8, 12, 16]));
      const finalizing = snapshots.filter((snapshot) => snapshot.phase === "finalizing");
      expect(finalizing.length).toBeGreaterThan(0);
      expect(finalizing.every((snapshot) => snapshot.videoAssetId === null)).toBe(true);
      expect(snapshots[snapshots.length - 1].phase).toBe("completed");
    });

    it("should persist the confirmed position after every chunk", async () => {
      const { manager, store } = setup(server);
      const saved: number[] = [];
      const original = store.storage.save;
      store.storage.save = (record) => {
        saved.push(record.confirmedBytes);
        original(record);
      };

      await manager.start(makeFile());

      expect(saved).toEqual(expect.arrayContaining([0, 4, 8, 12, 16, 22]));
    });

    it("should keep polling while the server is finalizing and nudge it when it takes too long", async () => {
      server.pollsUntilComplete = 4;
      let clock = 0;
      const { manager } = setup(server, { now: () => (clock += UPLOAD_FINALIZE_NUDGE_AFTER_MS) });

      await manager.start(makeFile());

      expect(server.finalizeRequests).toBe(1);
      expect(manager.getSnapshot().phase).toBe("completed");
    });
  });

  describe("interruptions", () => {
    it("should retry after a network failure and finish with identical bytes", async () => {
      server.chunkFaults = ["ok", "ok", "network", "network"];
      const { manager, events } = setup(server);

      await manager.start(makeFile());

      expect(server.committed).toEqual(BYTES);
      expect(events.find((event) => event.type === "interrupted")).toEqual({
        type: "interrupted",
        reason: "network",
        attempt: 1,
      });
      expect(events.find((event) => event.type === "recovered")).toEqual({ type: "recovered", attempts: 2 });
      expect(manager.getSnapshot().phase).toBe("completed");
    });

    it("should not resend a chunk whose acknowledgement was lost", async () => {
      server.chunkFaults = ["ok", "ack-lost"];
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(server.committed).toEqual(BYTES);
      expect(new Set(server.sentOffsets).size).toBe(server.sentOffsets.length);
    });

    it("should continue from the offset the server reports on a mismatch", async () => {
      server.chunkFaults = ["ok", { http: 409, code: "offset_mismatch", offset: 4 }];
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(server.committed).toEqual(BYTES);
      expect(manager.getSnapshot().phase).toBe("completed");
    });

    it("should re-query the session when a mismatch carries no offset hint", async () => {
      server.chunkFaults = ["ok", { http: 409, code: "session_not_active" }];
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(server.committed).toEqual(BYTES);
    });

    it("should retry a server error and honour Retry-After", async () => {
      server.chunkFaults = [{ http: 503, retryAfterMs: 5000 }];
      const { manager, events } = setup(server);

      await manager.start(makeFile());

      expect(fakeSleep).toHaveBeenCalledWith(5000, expect.anything());
      expect(events.find((event) => event.type === "interrupted")).toMatchObject({ reason: "server" });
      expect(manager.getSnapshot().phase).toBe("completed");
    });

    it("should retry a status query that fails transiently", async () => {
      server.statusFaults = [new UploadApiError("network", 0, "network_error")];
      const { manager } = setup(server, {}, storedFor(makeFile(), server.sessionId));
      server.fileSize = BYTES.length;

      await manager.start(makeFile());

      expect(manager.getSnapshot().phase).toBe("completed");
    });

    it("should wait for connectivity without spending retries while offline", async () => {
      let online = true;
      const waitForOnline = jest.fn(async () => {
        online = true;
      });
      const { manager, snapshots } = setup(server, { network: { isOnline: () => online, waitForOnline } });
      server.chunkFaults = ["ok", "network"];
      const sendChunk = server.sendChunk.bind(server);
      server.sendChunk = async (...args) => {
        try {
          return await sendChunk(...args);
        } catch (error) {
          online = false;
          throw error;
        }
      };

      await manager.start(makeFile());

      expect(waitForOnline).toHaveBeenCalledTimes(1);
      expect(snapshots.some((snapshot) => snapshot.notice === NOTICES.offline)).toBe(true);
      expect(server.committed).toEqual(BYTES);
      expect(manager.getSnapshot().stalled).toBe(false);
    });

    it("should stall after too many consecutive failures and restart on resume", async () => {
      server.chunkFaults = Array(UPLOAD_MAX_CONSECUTIVE_RETRIES + 1).fill("network");
      const { manager, events } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot()).toMatchObject({ phase: "interrupted", stalled: true, notice: NOTICES.stalled });
      expect(events[events.length - 1]).toEqual({ type: "failed", code: "retries_exhausted" });

      await manager.resume();

      expect(manager.getSnapshot().phase).toBe("completed");
      expect(server.committed).toEqual(BYTES);
      expect(server.created).toBe(1);
    });
  });

  describe("resuming across page loads", () => {
    it("should continue the stored session from the server's offset for the same file", async () => {
      const file = makeFile();
      server.fileSize = BYTES.length;
      await server.createSession({ filename: "talk.mp4", file_size: BYTES.length, client_key: "k" });
      server.committed = BYTES.slice(0, 8);
      server.created = 0;
      const { manager, events } = setup(server, {}, storedFor(file, server.sessionId));

      await manager.start(file);

      expect(server.created).toBe(0);
      expect(server.sentOffsets[0]).toBe(8);
      expect(server.committed).toEqual(BYTES);
      expect(events[0]).toEqual({ type: "started", resumed: true, sizeBytes: BYTES.length });
      expect(manager.getSnapshot().resumed).toBe(true);
    });

    it("should survive a dispose mid-upload and finish in a new manager", async () => {
      const file = makeFile();
      server.chunkFaults = ["ok", "ok", "hold"];
      const first = setup(server);
      const running = first.manager.start(file);
      await waitUntil(() => server.release !== null);

      first.manager.dispose();
      await running;
      expect(server.committed).toEqual(BYTES.slice(0, 8));

      const second = setup(server, {}, first.store.state.record);
      await second.manager.start(file);

      expect(server.created).toBe(1);
      expect(server.committed).toEqual(BYTES);
      expect(second.manager.getSnapshot()).toMatchObject({ phase: "completed", resumed: true });
    });

    it("should start a new session when the stored one belongs to a different file", async () => {
      const stored = storedFor(makeFile("other.mp4"), "old-session");
      const { manager } = setup(server, {}, stored);

      await manager.start(makeFile());

      expect(server.cancelled).toEqual(["old-session"]);
      expect(server.created).toBe(1);
    });

    it("should start a new session when the server no longer knows the stored one", async () => {
      server.knownSession = false;
      const { manager } = setup(server, {}, storedFor(makeFile(), "gone-session"));

      await manager.start(makeFile());

      expect(server.created).toBe(1);
      expect(server.committed).toEqual(BYTES);
    });

    it("should start a new session when the stored one was for a differently sized file", async () => {
      server.fileSize = 999;
      server.knownSession = true;
      const { manager } = setup(server, {}, storedFor(makeFile(), server.sessionId));

      await manager.start(makeFile());

      expect(server.created).toBe(1);
    });

    it("should rethrow unexpected errors while re-attaching", async () => {
      server.statusFaults = [new UploadApiError("http", 403, "http_403")];
      const { manager } = setup(server, {}, storedFor(makeFile(), server.sessionId));

      await manager.start(makeFile());

      expect(manager.getSnapshot().failure?.code).toBe("rejected");
    });
  });

  describe("failures", () => {
    it.each([
      [{ http: 410, code: "session_expired" }, "expired", true],
      [{ http: 422, code: "invalid_file_signature" }, "rejected", true],
      [{ http: 403 }, "rejected", true],
    ] as const)("should fail on %j with %s and drop the stored reference", async (fault, code, cleared) => {
      server.chunkFaults = [fault];
      const { manager, store } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot()).toMatchObject({ phase: "failed", failure: { code, message: FAILURE_MESSAGES[code] } });
      expect(store.state.record === null).toBe(cleared);
    });

    it("should report an expired session and not retry", async () => {
      server.chunkFaults = [{ http: 410, code: "session_expired" }];
      const { manager, events } = setup(server);

      await manager.start(makeFile());

      expect(server.sentOffsets).toHaveLength(1);
      expect(events[events.length - 1]).toEqual({ type: "failed", code: "expired" });
    });

    it("should fail as unauthorized and keep the stored session for after logging in", async () => {
      server.chunkFaults = [{ http: 401 }];
      const { manager, store } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot().failure).toEqual({
        code: "unauthorized",
        message: FAILURE_MESSAGES.unauthorized,
        retryable: false,
      });
      expect(store.state.record?.sessionId).toBe(server.sessionId);
    });

    it("should treat a full server disk as retryable and resume once it is retried", async () => {
      server.chunkFaults = ["ok", { http: 507, code: "insufficient_storage" }];
      const { manager, store } = setup(server);

      await manager.start(makeFile());
      expect(manager.getSnapshot().failure).toMatchObject({ code: "storage_full", retryable: true });
      expect(store.state.record).not.toBeNull();

      await manager.resume();

      expect(manager.getSnapshot().phase).toBe("completed");
      expect(server.committed).toEqual(BYTES);
    });

    it("should report a processing failure that happens during finalization", async () => {
      server.errorCode = "processing_failed";
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot().failure?.code).toBe("processing_failed");
    });

    it.each([
      ["size_mismatch", "verification_failed"],
      ["checksum_mismatch", "verification_failed"],
      ["something_else", "unknown"],
    ])("should map the finalization error %s to %s", async (errorCode, expected) => {
      server.errorCode = errorCode;
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot().failure?.code).toBe(expected);
    });

    it("should report unexpected non-API errors as unknown", async () => {
      server.createSession = async () => {
        throw new Error("boom");
      };
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot().failure?.code).toBe("unknown");
    });

    it("should fail when the server reports a cancelled session during finalization", async () => {
      server.getSession = async () => ({
        ...(await FakeUploadServer.prototype.getSession.call(server, server.sessionId)),
        upload_status: "CANCELLED",
      });
      server.chunkFaults = [];
      const { manager } = setup(server);

      await manager.start(makeFile());

      expect(manager.getSnapshot().phase).toBe("failed");
    });
  });

  describe("pause, resume and cancel", () => {
    it("should pause an in-flight chunk, then resume from the server's offset without losing data", async () => {
      server.chunkFaults = ["ok", "hold"];
      const { manager, events } = setup(server);
      const running = manager.start(makeFile());
      await waitUntil(() => server.release !== null);

      manager.pause();
      await waitUntil(() => manager.getSnapshot().phase === "paused");
      expect(manager.getSnapshot().confirmedBytes).toBe(4);

      manager.resume();
      await running;

      expect(server.committed).toEqual(BYTES);
      expect(events.map((event) => event.type)).toEqual(expect.arrayContaining(["paused", "continued", "completed"]));
    });

    it("should ignore pause and resume when nothing is transferring", async () => {
      const { manager, events } = setup(server);

      manager.pause();
      manager.resume();

      expect(events).toEqual([]);
      expect(manager.getSnapshot().phase).toBe("idle");
    });

    it("should ignore a second pause", async () => {
      server.chunkFaults = ["ok", "hold"];
      const { manager, events } = setup(server);
      const running = manager.start(makeFile());
      await waitUntil(() => server.release !== null);

      manager.pause();
      manager.pause();
      manager.resume();
      await running;

      expect(events.filter((event) => event.type === "paused")).toHaveLength(1);
    });

    it("should cancel the session on the server and clear the stored reference", async () => {
      server.chunkFaults = ["ok", "hold"];
      const { manager, store, events } = setup(server);
      const running = manager.start(makeFile());
      await waitUntil(() => server.release !== null);

      await manager.cancel();
      await running;

      expect(server.cancelled).toEqual([server.sessionId]);
      expect(store.state.record).toBeNull();
      expect(manager.getSnapshot().phase).toBe("cancelled");
      expect(events[events.length - 1]).toEqual({ type: "cancelled" });
    });

    it.each([
      ["a permanent failure", { http: 403 }],
      ["a rejected file", { http: 422, code: "invalid_file_signature" }],
    ])("should not ask the server to cancel after %s", async (_name, fault) => {
      server.chunkFaults = [fault];
      const { manager, store } = setup(server);
      await manager.start(makeFile());

      await manager.cancel();

      expect(server.cancelled).toEqual([]);
      expect(store.state.record).toBeNull();
      expect(manager.getSnapshot().phase).toBe("cancelled");
    });

    it("should not ask the server to cancel once the file is finalizing", async () => {
      server.pollsUntilComplete = 50;
      const { manager } = setup(server);
      const running = manager.start(makeFile());
      await waitUntil(() => manager.getSnapshot().phase === "finalizing");

      await manager.cancel();
      await running;

      expect(server.cancelled).toEqual([]);
    });

    it("should still cancel on the server after a retryable failure", async () => {
      server.chunkFaults = ["ok", { http: 507, code: "insufficient_storage" }];
      const { manager } = setup(server);
      await manager.start(makeFile());

      await manager.cancel();

      expect(server.cancelled).toEqual([server.sessionId]);
    });

    it("should retry cancelling while the server is still writing the last chunk", async () => {
      const cancel = jest
        .fn()
        .mockRejectedValueOnce(new UploadApiError("http", 409, "upload_in_progress"))
        .mockResolvedValueOnce(undefined);
      server.cancelSession = cancel;
      const { manager } = setup(server, {}, storedFor(makeFile(), server.sessionId));

      await manager.cancel();

      expect(cancel).toHaveBeenCalledTimes(2);
    });

    it("should give up cancelling on a permanent error", async () => {
      const cancel = jest.fn().mockRejectedValue(new UploadApiError("http", 409, "session_not_active"));
      server.cancelSession = cancel;
      const { manager } = setup(server, {}, storedFor(makeFile(), server.sessionId));

      await manager.cancel();

      expect(cancel).toHaveBeenCalledTimes(1);
    });

    it("should discard a stored upload from an earlier page load", async () => {
      const { manager, store } = setup(server, {}, storedFor(makeFile(), "left-behind"));

      expect(manager.peekStored()?.sessionId).toBe("left-behind");
      await manager.discardStored();

      expect(server.cancelled).toEqual(["left-behind"]);
      expect(store.state.record).toBeNull();
    });

    it("should do nothing when discarding with no stored upload", async () => {
      const { manager } = setup(server);

      await manager.discardStored();

      expect(server.cancelled).toEqual([]);
    });

    it("should replace a running upload when a new file is started", async () => {
      server.chunkFaults = ["hold"];
      const { manager } = setup(server);
      const first = manager.start(makeFile("first.mp4"));
      await waitUntil(() => server.release !== null);

      server.chunkFaults = [];
      await manager.start(makeFile("second.mp4"));
      await first;

      expect(manager.getSnapshot().phase).toBe("completed");
      expect(server.committed).toEqual(BYTES);
    });

    it("should stop notifying once disposed", async () => {
      server.chunkFaults = ["hold"];
      const { manager, snapshots } = setup(server);
      const running = manager.start(makeFile());
      await waitUntil(() => server.release !== null);
      const before = snapshots.length;

      manager.dispose();
      await running;

      expect(snapshots).toHaveLength(before);
    });
  });
});
