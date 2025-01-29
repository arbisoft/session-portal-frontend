export type AlertModalProps = {
  handleCloseAlertModal: () => void;
  errorMessage?: string;
  vertical?: "bottom" | "top";
  horizontal?: "center" | "left" | "right";
  severity?: "success" | "info" | "warning" | "error";
};
