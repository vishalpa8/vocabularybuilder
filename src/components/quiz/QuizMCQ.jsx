import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";



const QuizMCQ = ({
  currentWord,
  options,
  isAnswered,
  selectedAnswer,
  handleAnswer,
  progress,
  currentQuestion,
  totalQuestions,
  quizType,
}) => {
  const theme = useTheme();

  if (!currentWord || !options || options.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography color="text.secondary">No question available.</Typography>
      </Box>
    );
  }

  const isWordToMeaning = quizType === "wordToMeaning";
  const question = isWordToMeaning ? currentWord.word : currentWord.meaning;
  const correctAnswer = isWordToMeaning
    ? currentWord.meaning
    : currentWord.word;

  

  // Generate unique keys for options
  const getOptionKey = (option, idx) => `${option}-${idx}`;

  // Option card style
  const getOptionCardStyle = (option) => {
    if (!isAnswered) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        boxShadow: "none",
        fontWeight: 500,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          background: theme.palette.action.hover,
        },
        fontSize: "1.1rem",
        userSelect: "none",
      };
    }
    // Feedback state
    const isCorrectAnswer = option === correctAnswer;
    const isSelectedAnswer = option === selectedAnswer;

    if (isCorrectAnswer) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2px solid ${theme.palette.success.light}`,
        background: theme.palette.success.light + "22",
        borderRadius: 2,
        fontWeight: 600,
        fontSize: "1.1rem",
        userSelect: "none",
        color: theme.palette.success.main,
      };
    } else if (isSelectedAnswer) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2px solid ${theme.palette.error.light}`,
        background: theme.palette.error.light + "22",
        borderRadius: 2,
        fontWeight: 600,
        fontSize: "1.1rem",
        userSelect: "none",
        color: theme.palette.error.main,
        opacity: 0.95,
      };
    }
    // Faded for others
    return {
      mb: 1.5,
      px: 2,
      py: 2,
      border: `2px solid ${theme.palette.divider}`,
      borderRadius: 2,
      fontWeight: 500,
      fontSize: "1.1rem",
      color: theme.palette.text.primary,
      opacity: 0.6,
      userSelect: "none",
      background: theme.palette.background.paper,
      cursor: "not-allowed",
    };
  };

  // Keyboard accessibility for options
  const handleOptionKeyDown = (option, event) => {
    if (!isAnswered && (event.key === "Enter" || event.key === " ")) {
      handleAnswer(option);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress || 0}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${currentQuestion || 1}/${totalQuestions || 1}`}
          </Typography>
        </Box>
      </Box>
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent
          sx={{
            minHeight: 140, // Increased height for better visual balance
            display: "flex",
            flexDirection: "column", // Allow content to stack if needed
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 2, sm: 3 }, // Add padding
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
              lineHeight: 1.3, // Adjust line height for better readability
            }}
          >
            {question}
          </Typography>
        </CardContent>
      </Card>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {options.map((option, idx) => (
          <Paper
            key={getOptionKey(option, idx)}
            elevation={
              isAnswered &&
              (option === correctAnswer || option === selectedAnswer)
                ? 2
                : 1
            }
            component="button"
            role="button"
            tabIndex={isAnswered ? -1 : 0}
            aria-disabled={isAnswered}
            sx={getOptionCardStyle(option)}
            onClick={!isAnswered ? () => handleAnswer(option) : undefined}
            onKeyDown={
              !isAnswered ? (e) => handleOptionKeyDown(option, e) : undefined
            }
          >
            {option}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default QuizMCQ;
