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
import { useTheme } from "@mui/material/styles";



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
  const theme = useTheme();
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
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent
          sx={{
            minHeight: 140,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "primary.main",
              wordBreak: "break-word",
              lineHeight: 1.3,
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
          <Typography variant="h6" color="error" sx={{ fontWeight: 600 }}>
            Incorrect. Try again.
          </Typography>
        )}
        {isAnswered && (
          <Paper
            elevation={4}
            sx={{
              p: 3,
              width: "100%",
              borderRadius: 2,
              backgroundColor: isCorrect
                ? theme.palette.success.light
                : theme.palette.error.light,
              color: isCorrect
                ? theme.palette.success.contrastText
                : theme.palette.error.contrastText,
              boxShadow: 6,
            }}
          >
            <Typography variant="h6" align="center" sx={{ fontWeight: 700 }}>
              {isCorrect ? (
                "Correct!"
              ) : (
                <>
                  Incorrect.
                  <br />
                  Correct Answer: <b>{currentWord.word}</b>
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
