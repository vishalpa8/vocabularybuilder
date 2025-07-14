import React from "react";
import { Modal, Box, Typography, Button, Paper } from "@mui/material";
import { CheckCircle, Cancel, Info } from "@mui/icons-material";

const InfoModal = ({
  open,
  onClose,
  onConfirm,
  onAddOnlyNew, // Optional: "Add Only New Words" button handler
  title,
  message,
  type = "info", // 'info', 'confirm', 'success', 'error'
  maxWidth = 400,
  importOptions = [],
}) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    outline: "none",
  };

  const iconStyle = {
    fontSize: "4rem",
    mb: 2,
  };
  const icons = {
    info: <Info color="primary" sx={iconStyle} />,
    confirm: <Info color="action" sx={iconStyle} />,
    success: <CheckCircle color="success" sx={iconStyle} />,
    error: <Cancel color="error" sx={iconStyle} />,
  };

  // Button arrangement based on importOptions for full flexibility
  const showAddOnlyNew =
    type === "confirm" &&
    typeof onAddOnlyNew === "function" &&
    importOptions?.includes("addOnlyNew");
  const showConfirm = type === "confirm";
  const confirmLabel = showConfirm ? "Confirm" : "OK";

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Paper sx={modalStyle} tabIndex={-1}>
        {icons[type]}
        <Typography id="modal-title" variant="h5" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box id="modal-description" sx={{ mb: 4, width: "100%" }}>
          {message}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {showConfirm && (
            <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<Cancel />}
              size="large"
              sx={{ flexGrow: 1 }}
            >
              Cancel
            </Button>
          )}
          {showAddOnlyNew && (
            <Button
              variant="outlined"
              onClick={onAddOnlyNew}
              color="secondary"
              size="large"
              sx={{ flexGrow: 1 }}
            >
              Add Only New Words
            </Button>
          )}
          <Button
            variant="contained"
            onClick={onConfirm || onClose}
            color={showConfirm ? "primary" : "inherit"}
            startIcon={showConfirm ? <CheckCircle /> : null}
            size="large"
            sx={{ flexGrow: 1 }}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default InfoModal;
