import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  History,
  Delete,
} from "@mui/icons-material";
import InfoModal from "../InfoModal";
import { filterOldHistory } from "../../utils/quizUtils";

const QuizHistory = () => {
  const [history, setHistory] = useState([]);
  const [modalState, setModalState] = useState({ open: false, index: null });

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("quizHistory") || "[]"
    );
    const recentHistory = filterOldHistory(storedHistory, 30);
    // Update storage if old records are deleted
    if (recentHistory.length !== storedHistory.length) {
      localStorage.setItem("quizHistory", JSON.stringify(recentHistory));
    }
    setHistory(
      recentHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  }, []);

  const openModal = (index) => setModalState({ open: true, index });
  const closeModal = () => setModalState({ open: false, index: null });

  const handleDelete = () => {
    if (modalState.index === null) return;
    const newHistory = history.filter((_, i) => i !== modalState.index);
    setHistory(newHistory);
    localStorage.setItem("quizHistory", JSON.stringify(newHistory));
    closeModal();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-GB", options).replace(/,/, "");
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <>
      <Paper sx={{ p: { xs: 3, sm: 5 }, mt: 4, borderRadius: 3, boxShadow: 6, overflow: "hidden", bgcolor: "background.paper" }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
        >
          <History sx={{ fontSize: 30 }} /> Quiz History
        </Typography>
        {history.map((session, index) => (
          <Accordion key={session.date}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ flexShrink: 0, mr: 2 }}>
                  {formatDate(session.date)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  Score: {session.score.correct} / {session.score.total}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                pt: 0, // Remove top padding to reduce space
                pb: 2, // Add some bottom padding
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <Tooltip title="Delete History">
                  <IconButton
                    onClick={() => openModal(index)}
                    size="small"
                    aria-label="Delete History"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  maxHeight: 350,
                  overflow: "auto",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  // border: 1, borderColor: 'divider', // Optional: uncomment for a border
                }}
              >
                <List dense>
                  {(session.results || []).length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No details recorded for this session." />
                    </ListItem>
                  ) : (
                    session.results.map((result, i) => (
                      <ListItem key={i}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {result.isCorrect ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Cancel color="error" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.word?.word || ""}
                          secondary={
                            result.isCorrect
                              ? "Correct"
                              : `Your answer: ${
                                  result.selectedAnswer
                                } | Correct: ${result.word?.meaning || ""}`
                          }
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      <InfoModal
        open={modalState.open}
        onClose={closeModal}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this quiz history? This action cannot be undone."
        type="confirm"
      />
    </>
  );
};

export default QuizHistory;
