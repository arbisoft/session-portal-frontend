import Button from "@mui/material/Button";
import styled from "@mui/material/styles/styled";

export const StyledGoogleButton = styled(Button)(({ theme }) => ({
  width: "100%",
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  backgroundColor:
    theme.palette.mode === "light" ? "#fff" : theme.palette.grey[900],
  color:
    theme.palette.mode === "light"
      ? theme.palette.grey[900]
      : theme.palette.common.white,
  textTransform: "none",
  border: `1px solid ${theme.palette.mode === "light" ? theme.palette.grey[300] : theme.palette.grey[700]}`,
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  fontWeight: 500,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[800],
    borderColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[600],
  },
  "&:active": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[700],
  },
}));
