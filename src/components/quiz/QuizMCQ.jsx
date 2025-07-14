import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Button,
  useTheme,
} from "@mui/material";

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

  // Compute button props for each option
  const getButtonProps = (option) => {
    const baseSx = {
      minHeight: 56,
      fontSize: "1rem",
      textTransform: "none",
      fontWeight: 500,
      borderRadius: 2,
      transition: "background .2s",
    };

    if (!isAnswered) {
      return {
        variant: "outlined",
        color: "primary",
        onClick: () => handleAnswer(option),
        disabled: false,
        sx: baseSx,
      };
    }
    // After answer selected:
    if (option === currentWord.meaning) {
      return {
        variant: "contained",
        color: "success",
        sx: {
          ...baseSx,
          bgcolor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          "&:hover": { bgcolor: theme.palette.success.dark },
        },
        disabled: true,
      };
    }
    if (option === selectedAnswer) {
      return {
        variant: "contained",
        color: "error",
        sx: {
          ...baseSx,
          bgcolor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          "&:hover": { bgcolor: theme.palette.error.dark },
        },
        disabled: true,
      };
    }
    return {
      variant: "outlined",
      color: "primary",
      disabled: true,
      sx: baseSx,
    };
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: { xs: 1, sm: 4 } }}>
      {/* Progress bar and question count */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "action.hover",
            }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            minWidth: 52,
            textAlign: "center",
          }}
        >{`${currentQuestion}/${totalQuestions}`}</Typography>
      </Box>

      {/* Word card */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent
          sx={{
            minHeight: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              textAlign: "center",
              wordBreak: "break-word",
              fontWeight: 600,
            }}
          >
            {currentWord.word}
          </Typography>
        </CardContent>
      </Card>

      {/* MCQ Options */}
      <Grid container spacing={2}>
        {options.map((option, idx) => {
          const btnProps = getButtonProps(option);
          return (
            <Grid item xs={12} sm={6} key={idx}>
              <Button fullWidth {...btnProps} tabIndex={0}>
                {option}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuizMCQ;
