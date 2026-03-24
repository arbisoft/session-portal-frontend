import React from "react";

import userEvent from "@testing-library/user-event";

import { render, screen, act, waitFor, fireEvent } from "@/jest/utils/testUtils";

import { NotificationProvider, useNotification, notificationReducer, notificationManager } from "./notification";

const TestComponent = () => {
  const notifier = useNotification();

  return (
    <div>
      <button onClick={() => notifier.showNotification({ message: "Test Alert", severity: "success" })}>Show Notification</button>
    </div>
  );
};

describe("notificationReducer", () => {
  const initialState = {
    horizontal: "right" as const,
    vertical: "top" as const,
    message: "",
    open: false,
    severity: "info" as const,
  };

  it("should handle SHOW_NOTIFICATION", () => {
    const nextState = notificationReducer(initialState, {
      type: "SHOW_NOTIFICATION",
      payload: { message: "Test", severity: "success" },
    });
    expect(nextState.open).toBe(true);
    expect(nextState.message).toBe("Test");
    expect(nextState.severity).toBe("success");
  });

  it("should handle HIDE_NOTIFICATION", () => {
    const shown = { ...initialState, open: true, message: "Test" };
    const nextState = notificationReducer(shown, { type: "HIDE_NOTIFICATION" });
    expect(nextState.open).toBe(false);
    expect(nextState.message).toBe("Test");
  });

  it("should return state for unknown actions", () => {
    // @ts-expect-error - intentionally using bad action type
    const nextState = notificationReducer(initialState, { type: "UNKNOWN" });
    expect(nextState).toBe(initialState);
  });
});

describe("NotificationManager", () => {
  it("should notify subscribers when showing and hiding notifications", () => {
    const listener = jest.fn();
    const unsubscribe = notificationManager.subscribe(listener);

    notificationManager.showNotification({ message: "Hi", severity: "info" });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ open: true, message: "Hi" }));

    notificationManager.hideNotification();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ open: false }));

    unsubscribe();
  });
});

describe("NotificationProvider", () => {
  it("should renders children", () => {
    render(
      <NotificationProvider>
        <div data-testid="child">Child</div>
      </NotificationProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should displays a notification when showNotification is called", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText("Show Notification"));
    });

    expect(await screen.findByText("Test Alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Test Alert");
  });

  it("should auto hides the notification after timeout", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText("Show Notification"));
    });

    expect(await screen.findByText("Test Alert")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("throws error when useNotification is used outside provider", () => {
    const originalError = console.error;
    console.error = jest.fn(); // Suppress expected error logs

    const BrokenComponent = () => {
      useNotification(); // Should throw
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow("useNotification must be used within a NotificationProvider");

    console.error = originalError;
  });

  it("closes notification on Snackbar close event", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    fireEvent.click(screen.getByText("Show Notification"));

    expect(await screen.findByText("Test Alert")).toBeInTheDocument();

    // MUI provides a close button in the Alert component
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Test Alert")).not.toBeInTheDocument();
    });
  });
});
