import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import { Replay, ArrowBack } from '@mui/icons-material';
import QuizResultDetails from './QuizResultDetails';
import QuizHistory from './QuizHistory';

const QuizComplete = ({ results, onRestart, onReturn }) => {
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalQuestions = results.length;

  return (
    <Box>
      <Paper sx={{ textAlign: 'center', p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Quiz Complete!
        </Typography>
        <Typography sx={{ my: 2 }}>
          You scored {correctAnswers} out of {totalQuestions}.
        </Typography>
        <QuizResultDetails results={results} />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={onReturn}
            startIcon={<ArrowBack />}
          >
            New Quiz
          </Button>
          <Button
            variant="contained"
            onClick={onRestart}
            startIcon={<Replay />}
          >
            Start Again
          </Button>
        </Box>
      </Paper>
      <QuizHistory />
    </Box>
  );
};

export default QuizComplete;
