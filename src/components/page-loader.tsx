import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";

type PageLoaderType = {
  isLoading: boolean;
};

export function PageLoader({ isLoading }: PageLoaderType) {
  return (
    <Modal open={isLoading}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          outline: "none",
        }}
      >
        <CircularProgress />
      </Box>
    </Modal>
  );
}
