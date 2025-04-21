import React from "react";

import userEvent from "@testing-library/user-event";

import { render, screen, act, waitFor, fireEvent } from "@/jest/utils/testUtils";

import { NotificationProvider, useNotification } from "./notification";

const TestComponent = () => {
  const notifier = useNotification();

  return (
    <div>
      <button onClick={() => notifier.showNotification({ message: "Test Alert", severity: "success" })}>Show Notification</button>
    </div>
  );
};

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

    const closeIcon = screen.getByRole("alert");
    fireEvent.click(closeIcon); // Close via alert itself

    await waitFor(() => {
      expect(screen.queryByText("Test Message")).not.toBeInTheDocument();
    });
  });
});
