import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

export default function ImageViewer({
  url,
  handleClose,
}: {
  url: string | null;
  handleClose: () => void;
}) {
  return (
    <Modal open={Boolean(url)} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          // width: "90vw",
          // height: "90vh",
          // bgcolor: "background.paper",
          boxShadow: 24,
        }}
      >
        <img
          src={url || ""}
          width="100%"
          height="100%"
          style={{ maxHeight: "90vh", maxWidth: "90vw" }}
        />
      </Box>
    </Modal>
  );
}
