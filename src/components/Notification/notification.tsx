"use client";
import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";

import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Snackbar, { SnackbarOrigin } from "@mui/material/Snackbar";

type Notification = {
  horizontal?: SnackbarOrigin["horizontal"];
  message: string;
  open: boolean;
  severity: AlertColor;
  vertical?: SnackbarOrigin["vertical"];
};

type NotificationAction = { type: "SHOW_NOTIFICATION"; payload: Omit<Notification, "open"> } | { type: "HIDE_NOTIFICATION" };

type NotificationState = Notification;

const initialState: NotificationState = {
  horizontal: "right",
  message: "",
  open: false,
  severity: "info",
  vertical: "top",
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case "SHOW_NOTIFICATION":
      return { ...action.payload, open: true };
    case "HIDE_NOTIFICATION":
      return { ...state, open: false };
    default:
      return state;
  }
};

class NotificationManager {
  private state: NotificationState = initialState;
  private listeners: Array<(state: NotificationState) => void> = [];

  public showNotification(payload: Omit<Notification, "open">) {
    this.state = notificationReducer(this.state, { type: "SHOW_NOTIFICATION", payload });
    this.notifyListeners();
  }

  public hideNotification() {
    this.state = notificationReducer(this.state, { type: "HIDE_NOTIFICATION" });
    this.notifyListeners();
  }

  public getState(): NotificationState {
    return this.state;
  }

  public subscribe(listener: (state: NotificationState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const notificationManager = new NotificationManager();

const NotificationContext = createContext<NotificationManager | null>(null);

const { Provider } = NotificationContext;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(notificationManager.getState());

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider value={notificationManager}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={() => notificationManager.hideNotification()}
        anchorOrigin={{ vertical: state.vertical ?? "top", horizontal: state.horizontal || "right" }}
      >
        <MuiAlert variant="filled" onClose={() => notificationManager.hideNotification()} severity={state.severity}>
          {state.message}
        </MuiAlert>
      </Snackbar>
    </Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
