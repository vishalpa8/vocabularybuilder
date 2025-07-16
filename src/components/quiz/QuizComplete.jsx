import React from "react";
import { Paper, Typography, Button, Box } from "@mui/material";
import { Replay, ArrowBack } from "@mui/icons-material";
import QuizResultDetails from "./QuizResultDetails";
import QuizHistory from "./QuizHistory";

const QuizComplete = ({ results, onRestart, onReturn, quizMode }) => {
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const totalQuestions = results.length;
  const retentionScore = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: { xs: 2, sm: 5 } }}>
      <Paper
        sx={{
          textAlign: "center",
          p: { xs: 3, sm: 5 }, // Increased padding
          borderRadius: 3, // More rounded corners
          boxShadow: 6, // More prominent shadow
          bgcolor: "background.paper", // Ensure consistent background
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          {quizMode === 'revision' ? 'Revision Complete!' : 'Quiz Complete!'}
        </Typography>
        <Typography variant="h5" color="success.main" sx={{ my: 3, fontWeight: 600 }}>
          {quizMode === 'revision' ? 
            `Your Retention Score: ${retentionScore}%` : 
            `You scored ${correctAnswers} out of ${totalQuestions}.`
          }
        </Typography>
        <QuizResultDetails results={results} />
        <Box
          sx={{
            mt: 4, // Increased top margin
            display: "flex",
            justifyContent: "center",
            gap: 3, // Increased gap between buttons
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={onReturn}
            startIcon={<ArrowBack />}
            size="large"
          >
            New Quiz
          </Button>
          <Button
            variant="contained"
            onClick={onRestart}
            startIcon={<Replay />}
            size="large"
          >
            Start Again
          </Button>
        </Box>
      </Paper>
      <Box sx={{ mt: 5 }}>
        <QuizHistory />
      </Box>
    </Box>
  );
};

export default QuizComplete;
