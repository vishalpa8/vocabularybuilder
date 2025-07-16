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
  showButtons = true, // New prop to control button visibility
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
    p: type === "edit" ? 2 : 4,
    borderRadius: 2,
    textAlign: type === "edit" ? "left" : "center",
    display: "flex",
    flexDirection: "column",
    alignItems: type === "edit" ? "stretch" : "center",
    outline: "none",
    maxHeight: type === "edit" ? "95vh" : "90vh",
    height: type === "edit" ? "auto" : "auto",
    overflow: type === "edit" ? "hidden" : "auto",
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
    edit: null, // No icon for edit type
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
        {title && (
          <Typography
            id="modal-title"
            variant="h5"
            component="h2"
            sx={{ mb: 2 }}
          >
            {title}
          </Typography>
        )}
        <Box
          id="modal-description"
          sx={{ mb: showButtons ? 4 : 0, width: "100%" }}
        >
          {message}
        </Box>
        {showButtons && (
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
        )}
      </Paper>
    </Modal>
  );
};

export default InfoModal;
