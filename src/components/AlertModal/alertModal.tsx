import { FC } from "react";

import Snackbar from "@mui/material/Snackbar";

import { AlertContainer } from "./styled";
import { AlertModalProps } from "./types";

const AlertModal: FC<AlertModalProps> = ({
  handleCloseAlertModal,
  errorMessage = "Something wrong happened",
  vertical = "top",
  horizontal = "right",
  severity = "error",
}) => {
  return (
    <Snackbar
      open={!!errorMessage}
      autoHideDuration={6000}
      onClose={handleCloseAlertModal}
      anchorOrigin={{ vertical: vertical, horizontal: horizontal }}
    >
      <AlertContainer onClose={handleCloseAlertModal} severity={severity}>
        {errorMessage}
      </AlertContainer>
    </Snackbar>
  );
};

export default AlertModal;
