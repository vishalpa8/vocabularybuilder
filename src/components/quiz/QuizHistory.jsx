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
import { ExpandMore, CheckCircle, Cancel, History, Delete } from "@mui/icons-material";
import InfoModal from "../InfoModal";

const QuizHistory = () => {
  const [history, setHistory] = useState([]);
  const [modalState, setModalState] = useState({ open: false, index: null });

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    setHistory(storedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const openModal = (index) => {
    setModalState({ open: true, index });
  };

  const closeModal = () => {
    setModalState({ open: false, index: null });
  };

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-GB', options).replace(/,/, '');
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 4, overflow: 'hidden' }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History /> Quiz History
        </Typography>
        {history.map((session, index) => (
          <Accordion key={session.date}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ flexShrink: 0, mr: 2 }}>
                    {formatDate(session.date)}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Score: {session.score.correct} / {session.score.total}
                  </Typography>
                </Box>
                <Tooltip title="Delete History">
                  <IconButton onClick={(e) => { e.stopPropagation(); openModal(index);}} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {session.results.map((result, i) => (
                  <ListItem key={i}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {result.isCorrect ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.word.word}
                      secondary={`Correct: ${result.word.meaning}`}
                    />
                  </ListItem>
                ))}
              </List>
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