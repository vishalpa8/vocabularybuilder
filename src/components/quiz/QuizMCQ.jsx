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
}) => {
  const theme = useTheme();

  // Card styling logic for options
  const getOptionCardStyle = (option) => {
    if (!isAnswered) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2px solid ${theme.palette.divider}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "border-color 0.3s, background 0.3s",
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
    if (option === currentWord.meaning) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2.5px solid ${theme.palette.success.light}`,
        background: theme.palette.success.light + "11", // faded green
        borderRadius: 2,
        fontWeight: 600,
        fontSize: "1.1rem",
        userSelect: "none",
        boxShadow: "0 0 0 2px " + theme.palette.success.main + "44",
        color: theme.palette.success.main,
      };
    } else if (option === selectedAnswer) {
      return {
        mb: 1.5,
        px: 2,
        py: 2,
        border: `2.5px solid ${theme.palette.error.light}`,
        background: theme.palette.error.light + "11", // faded red
        borderRadius: 2,
        fontWeight: 600,
        fontSize: "1.1rem",
        userSelect: "none",
        boxShadow: "0 0 0 2px " + theme.palette.error.main + "33",
        color: theme.palette.error.main,
        opacity: 0.97,
      };
    }
    // Other options, lightly faded
    return {
      mb: 1.5,
      px: 2,
      py: 2,
      border: `2px solid ${theme.palette.divider}`,
      borderRadius: 2,
      fontWeight: 500,
      fontSize: "1.1rem",
      color: theme.palette.text.primary,
      opacity: 0.72,
      userSelect: "none",
      background: theme.palette.background.paper,
      cursor: "not-allowed",
    };
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >{`${currentQuestion}/${totalQuestions}`}</Typography>
        </Box>
      </Box>
      <Card elevation={1}>
        <CardContent
          sx={{
            minHeight: 140,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "primary.main",
              wordBreak: "break-word",
            }}
          >
            {currentWord.word}
          </Typography>
        </CardContent>
      </Card>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {options.map((option, idx) => (
          <Paper
            key={option}
            elevation={
              isAnswered &&
              (option === currentWord.meaning || option === selectedAnswer)
                ? 4
                : 1
            }
            sx={getOptionCardStyle(option)}
            onClick={!isAnswered ? () => handleAnswer(option) : undefined}
            tabIndex={0}
            aria-disabled={isAnswered}
          >
            {option}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default QuizMCQ;
