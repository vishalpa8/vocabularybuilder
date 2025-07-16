import React, { useState, useCallback } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  Backdrop,
  Fade,
  Snackbar,
  Alert,
} from "@mui/material";
import { db } from "../db/db";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  outline: "none", // Remove default outline
};

const Reset = () => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setError(null); // Clear any previous errors when opening
  };
  const handleClose = () => {
    setOpen(false);
    setError(null); // Clear any previous errors when closing
  };

  const handleSnackbarClose = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const clearAllData = useCallback(async () => {
    setIsDeleting(true);
    setError(null);
    try {
      // Clear IndexedDB
      await db.delete();
      await db.open(); // Reopen the database after deletion

      // Clear Local Storage
      localStorage.clear();

      // Clear Session Storage
      sessionStorage.clear();
      setSnackbarOpen(true);

      handleClose(); // Close modal on success
      // Optionally, reload the page or navigate to a fresh state
      // window.location.reload(); // Commented out for testing purposes
    } catch (err) {
      console.error("Failed to clear data:", err);
      setError("Failed to clear data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Debounce logic for the clearAllData function
  const debouncedClearAllData = useCallback(() => {
    let timeoutId;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(clearAllData, 500); // 500ms debounce
    };
  }, [clearAllData])();

  return (
    <div>
      <Button
        variant="contained"
        color="error"
        onClick={(e) => {
          e.currentTarget.blur();
          handleOpen();
        }}
        disabled={isDeleting}
        sx={{
          minWidth: 160,
          height: 48,
          borderRadius: 2,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.95rem",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            bgcolor: "error.dark",
            transform: "translateY(-2px)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 25px -5px rgba(211, 47, 47, 0.4)"
                : "0 8px 25px -5px rgba(211, 47, 47, 0.35)",
          },
        }}
      >
        {isDeleting ? "Resetting..." : "Reset All Data"}
      </Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography
              id="transition-modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Confirm Data Reset
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2, mb: 3 }}>
              Are you sure you want to delete ALL your vocabulary data? This
              action cannot be undone.
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={debouncedClearAllData}
                variant="contained"
                color="error"
                disabled={isDeleting}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            width: "100%",
            bgcolor: "#333", // Darker background color
            color: "#fff", // White text for contrast
            "& .MuiAlert-icon": {
              color: "#fff !important", // Ensure icon color is white
            },
          }}
        >
          All data cleared successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Reset;
