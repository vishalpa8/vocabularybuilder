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
      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4, overflow: "hidden" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <History /> Quiz History
        </Typography>
        {history.map((session, index) => (
          <Accordion key={session.date}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box>
                <Typography sx={{ flexShrink: 0, mr: 2 }}>
                  {formatDate(session.date)}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Score: {session.score.correct} / {session.score.total}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
              <List dense>{/* ... your results map here ... */}</List>
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
