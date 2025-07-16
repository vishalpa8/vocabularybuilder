import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Paper,
  Card,
  CardContent,
} from "@mui/material";

const QuizTyping = ({
  currentWord,
  handleAnswer,
  progress,
  currentQuestion,
  totalQuestions,
  isAnswered,
  selectedAnswer,
  typingAttempts,
}) => {
  const [answer, setAnswer] = useState("");
  const [lastWordId, setLastWordId] = useState(null);

  // Reset input only when new question is loaded
  useEffect(() => {
    if (!currentWord) return;
    if (currentWord.id !== lastWordId) {
      setAnswer("");
      setLastWordId(currentWord.id);
    }
  }, [currentWord, lastWordId]);

  // Submit answer
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || isAnswered) return;
    handleAnswer(answer);
  };

  const isCorrect =
    isAnswered &&
    selectedAnswer &&
    selectedAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
  const showIncorrectMessage = !isAnswered && typingAttempts > 0;

  useEffect(() => {
  }, [
    currentQuestion,
    answer,
    isAnswered,
    selectedAnswer,
    typingAttempts,
    currentWord,
  ]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${currentQuestion}/${totalQuestions}`}
          </Typography>
        </Box>
      </Box>
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: '#fefefe',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            borderRadius: 3,
            pointerEvents: 'none'
          }
        }}
      >
        <CardContent
          sx={{
            minHeight: 140,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, sm: 4 },
            position: 'relative',
            zIndex: 1
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              color: "#2c3e50",
              wordBreak: "break-word",
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {currentWord.meaning}
          </Typography>
        </CardContent>
      </Card>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Type the word"
          variant="outlined"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          fullWidth
          autoFocus
          disabled={isAnswered}
          error={showIncorrectMessage}
          sx={{ mb: 2 }}
          inputProps={{
            autoComplete: "off",
            spellCheck: "false",
          }}
        />
        {!isAnswered && (
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
            fullWidth
            disabled={!answer.trim() || isAnswered}
          >
            Submit
          </Button>
        )}
      </Box>
      <Box
        sx={{
          minHeight: "70px",
          mt: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showIncorrectMessage && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              width: "100%",
              borderRadius: 2,
              background: '#fff8f0',
              border: '1px solid #ffa726',
              boxShadow: '0 2px 8px rgba(255, 167, 38, 0.15)',
              position: 'relative'
            }}
          >
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#f57c00' }}>
              Incorrect. Try again.
            </Typography>
          </Paper>
        )}
        {isAnswered && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              width: "100%",
              borderRadius: 3,
              background: isCorrect ? '#f3f9f3' : '#fff0f0',
              border: isCorrect ? '1px solid #4caf50' : '1px solid #f44336',
              boxShadow: isCorrect 
                ? '0 4px 16px rgba(76, 175, 80, 0.15), 0 0 0 1px rgba(76, 175, 80, 0.1)' 
                : '0 4px 16px rgba(244, 67, 54, 0.15), 0 0 0 1px rgba(244, 67, 54, 0.1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isCorrect 
                  ? 'linear-gradient(135deg, transparent 0%, rgba(76, 175, 80, 0.05) 50%, transparent 100%)'
                  : 'linear-gradient(135deg, transparent 0%, rgba(244, 67, 54, 0.05) 50%, transparent 100%)',
                borderRadius: 3,
                pointerEvents: 'none'
              }
            }}
          >
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ 
                fontWeight: 600, 
                color: isCorrect ? '#2e7d32' : '#c62828',
                position: 'relative',
                zIndex: 1
              }}
            >
              {isCorrect ? (
                "🎉 Correct!"
              ) : (
                <>
                  ❌ Incorrect.
                  <br />
                  Correct Answer: <b style={{ color: '#1976d2' }}>{currentWord.word}</b>
                </>
              )}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default QuizTyping;
