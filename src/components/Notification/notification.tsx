"use client";
import React, { createContext, useReducer, useContext, ReactNode } from "react";

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

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
} | null>(null);

const { Provider } = NotificationContext;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  return (
    <Provider value={{ state, dispatch }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={() => dispatch({ type: "HIDE_NOTIFICATION" })}
        anchorOrigin={{ vertical: state.vertical ?? "top", horizontal: state.horizontal || "right" }}
      >
        <MuiAlert variant="filled" onClose={() => dispatch({ type: "HIDE_NOTIFICATION" })} severity={state.severity}>
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
