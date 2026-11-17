import React, { ReactNode } from "react";

import { useForm } from "react-hook-form";

import { UPLOAD_DRAFT_KEY } from "@/constants/constants";
import { act, renderHook } from "@/jest/utils/testUtils";
import { Providers } from "@/redux/store/provider";

import { FormValues } from "./fields";
import { useUploadDraft } from "./useUploadDraft";

jest.mock("@/services/uploadDraft/thumbnailStore", () => ({
  loadDraftThumbnail: jest.fn().mockResolvedValue(null),
  saveDraftThumbnail: jest.fn().mockResolvedValue(undefined),
}));

const DRAFT_KEY = `${UPLOAD_DRAFT_KEY}:anonymous`;
const wrapper = ({ children }: { children: ReactNode }) => <Providers>{children}</Providers>;

const renderDraftHook = () =>
  renderHook(
    () => {
      const form = useForm<FormValues>({ defaultValues: { title: "Typed", event_date: new Date(), description: "" } });
      useUploadDraft({
        control: form.control,
        getValues: form.getValues,
        setValue: form.setValue,
        thumbnail: null,
        onRestoreThumbnail: jest.fn(),
        presenters: [],
        onRestorePresenters: jest.fn(),
        file: new File(["x"], "talk.mp4", { type: "video/mp4" }),
      });
      return form;
    },
    { wrapper }
  );

describe("useUploadDraft", () => {
  beforeEach(() => window.localStorage.clear());

  it("should save a valid date and not throw on close while the session date is invalid", () => {
    const { result, unmount } = renderDraftHook();

    act(() => result.current.setValue("event_date", new Date(Number.NaN)));

    expect(() => unmount()).not.toThrow();
    const saved = JSON.parse(window.localStorage.getItem(DRAFT_KEY) as string);
    expect(saved.title).toBe("Typed");
    expect(Number.isNaN(new Date(saved.event_date).getTime())).toBe(false);
  });
});
