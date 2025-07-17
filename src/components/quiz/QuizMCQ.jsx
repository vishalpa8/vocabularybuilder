import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Stack,
  Fade,
  Chip,
} from "@mui/material";
import { 
  CheckCircle,
  Cancel,
  Lightbulb,
  Psychology,
} from "@mui/icons-material";
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
    <Fade in>
      <Box>
        {/* Progress and Question Counter */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ width: "100%", mr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress || 0}
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  borderRadius: 4,
                }
              }}
            />
          </Box>
          <Chip
            label={`${currentQuestion || 1}/${totalQuestions || 1}`}
            size="small"
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white'
            }}
          />
        </Box>

        {/* Question Card */}
        <Fade in key={currentWord.word}>
          <Card 
            elevation={6} 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <CardContent
              sx={{
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: { xs: 3, sm: 4 },
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Psychology sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                  {isWordToMeaning ? 'Find the meaning' : 'Find the word'}
                </Typography>
              </Box>
              
              <Typography
                variant="h3"
                component="div"
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  wordBreak: "break-word",
                  lineHeight: 1.2,
                  mb: 1
                }}
              >
                {question}
              </Typography>
              
              {currentWord.partOfSpeech && (
                <Chip
                  label={currentWord.partOfSpeech}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    mt: 1,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Options */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          {options.map((option, idx) => {
            const isCorrectAnswer = option === correctAnswer;
            const isSelectedAnswer = option === selectedAnswer;
            
            return (
                <Paper
                  key={idx}
                  elevation={isAnswered && (isCorrectAnswer || isSelectedAnswer) ? 4 : 2}
                  component="button"
                  role="button"
                  tabIndex={isAnswered ? -1 : 0}
                  aria-disabled={isAnswered}
                  sx={{
                    ...getOptionCardStyle(option),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': !isAnswered ? {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      borderColor: theme.palette.primary.main,
                      background: theme.palette.action.hover,
                    } : {},
                    '&:active': !isAnswered ? {
                      transform: 'translateY(0px)',
                    } : {}
                  }}
                  onClick={!isAnswered ? () => handleAnswer(option) : undefined}
                  onKeyDown={!isAnswered ? (e) => handleOptionKeyDown(option, e) : undefined}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: isAnswered ? 
                        (isCorrectAnswer ? theme.palette.success.main : 
                         isSelectedAnswer ? theme.palette.error.main : 
                         theme.palette.action.disabled) :
                        theme.palette.primary.main + '20',
                      color: isAnswered ? 'white' : theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </Box>
                    <Typography sx={{ flex: 1, textAlign: 'left' }}>
                      {option}
                    </Typography>
                    {isAnswered && isCorrectAnswer && (
                      <CheckCircle sx={{ color: theme.palette.success.main }} />
                    )}
                    {isAnswered && isSelectedAnswer && !isCorrectAnswer && (
                      <Cancel sx={{ color: theme.palette.error.main }} />
                    )}
                  </Box>
                </Paper>
            );
          })}
        </Stack>

        {/* Hint Section */}
        {currentWord.mnemonic && (
          <Fade in={isAnswered} timeout={1000}>
            <Box sx={{ mt: 3 }}>
              <Paper 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: theme.palette.info.light + '20',
                  border: `1px solid ${theme.palette.info.light}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <Lightbulb sx={{ color: theme.palette.info.main, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                    💡 Memory Tip
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentWord.mnemonic}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}
      </Box>
    </Fade>
  );
};

export default QuizMCQ;
