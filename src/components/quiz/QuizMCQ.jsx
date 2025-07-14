import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Button,
  useTheme,
} from '@mui/material';

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

  const getButtonStyle = (option) => {
    const baseStyle = {
      minHeight: 60,
      textTransform: 'none',
      fontSize: '1rem',
    };

    if (!isAnswered) {
      return { 
        variant: 'outlined', 
        color: 'primary', 
        onClick: () => handleAnswer(option),
        sx: baseStyle 
      };
    } else {
      // Answer has been selected
      if (option === currentWord.meaning) {
        return { 
          variant: 'contained', 
          sx: { ...baseStyle, backgroundColor: theme.palette.success.main, color: theme.palette.success.contrastText } 
        };
      } else if (option === selectedAnswer) {
        return { 
          variant: 'contained', 
          sx: { ...baseStyle, backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText } 
        };
      } else {
        // Other options when an answer has been selected
        return { 
          variant: 'outlined', 
          color: 'primary', 
          disabled: true, 
          sx: baseStyle 
        };
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${currentQuestion}/${totalQuestions}`}</Typography>
        </Box>
      </Box>
      <Card>
        <CardContent sx={{ minHeight: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" component="div" sx={{ textAlign: 'center' }}>
            {currentWord.word}
          </Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {options.map((option, index) => {
          const { variant, color, disabled, onClick, sx } = getButtonStyle(option);
          return (
            <Grid item xs={12} sm={6} key={index}>
              <Button
                fullWidth
                variant={variant}
                color={color}
                onClick={onClick}
                disabled={disabled}
                sx={sx}
              >
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
