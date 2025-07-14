import React from "react";
import { Modal, Box, Typography, Button, Paper } from "@mui/material";
import { CheckCircle, Cancel, Info } from "@mui/icons-material";

const InfoModal = ({
  open,
  onClose,
  onConfirm,
  onAddOnlyNew, // New prop for "Add Only New Words" button
  title,
  message,
  type = "info", // 'info', 'confirm', 'success', 'error'
  maxWidth = 400,
}) => {
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: maxWidth,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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

  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={modalStyle}>
        {icons[type]}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ mb: 4, width: "100%" }}>{message}</Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          {type === "confirm" && (
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
          {type === "confirm" && onAddOnlyNew && (
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
            color={type === "confirm" ? "primary" : "inherit"}
            startIcon={type === "confirm" ? <CheckCircle /> : null}
            size="large"
            sx={{ flexGrow: 1 }}
          >
            {type === "confirm" ? "Confirm" : "OK"}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default InfoModal;
