import React, { useState, useEffect } from "react";
import { useWords } from "../hooks/useWords";
import {
  sm2,
  getWordsForQuiz,
  getWordsForFlashcards,
  getWordsForRevisionChallenge,
  generateOptions,
} from "../utils/quizUtils";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  Fade,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Card,
  CardContent,
  Zoom,
  Modal,
  IconButton,
} from "@mui/material";
import { 
  PlayCircle, 
  Quiz as QuizIcon,
  Style as FlashcardIcon,
  Keyboard as TypingIcon,
  School as RevisionIcon,
  Timer,
  TrendingUp,
  Star,
  Bolt,
  Close,
} from "@mui/icons-material";
import QuizMCQ from "./quiz/QuizMCQ";
import QuizComplete from "./quiz/QuizComplete";
import QuizHistory from "./quiz/QuizHistory";
import Flashcard from "./Flashcard";
import InfoModal from "./InfoModal";
import QuizTyping from "./quiz/QuizTyping";

// Add pulse animation styles
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

// Inject the animation styles only once
if (typeof document !== 'undefined' && !document.querySelector('#quiz-pulse-animation')) {
  const style = document.createElement('style');
  style.id = 'quiz-pulse-animation';
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const Quiz = () => {
  const { words, updateWord } = useWords();
  const [quizWords, setQuizWords] = useState([]);
  const [lastQuizWords, setLastQuizWords] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const [options, setOptions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [quizLimit, setQuizLimit] = useState(10);
  const [quizMode, setQuizMode] = useState("quiz");
  const [quizType, setQuizType] = useState("wordToMeaning");
  const [modalState, setModalState] = useState({ open: false, title: "", message: "" });
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedQuizMode, setSelectedQuizMode] = useState(null);
  const [tempQuizLimit, setTempQuizLimit] = useState(10);
  const [tempQuizType, setTempQuizType] = useState("wordToMeaning");

  // NEW State Management
  const [quizStatus, setQuizStatus] = useState("setup"); // 'setup', 'answering', 'feedback', 'complete'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typingAttempts, setTypingAttempts] = useState(0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(300); // 5:00 in seconds

  useEffect(() => {
    let interval;
    if (quizStatus === 'answering' && (quizMode === 'quiz' || quizMode === 'typing' || quizMode === 'revision')) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time is up - save results with unanswered questions as wrong
            saveIncompleteQuizResults();
            setQuizStatus('complete');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStatus, quizMode]);

  // Save incomplete quiz results when time runs out
  const saveIncompleteQuizResults = () => {
    const completedResults = [...quizResults];
    
    // Add missing results for unanswered questions
    for (let i = completedResults.length; i < quizWords.length; i++) {
      completedResults.push({
        word: quizWords[i],
        selectedAnswer: null,
        isCorrect: false,
      });
    }
    
    setQuizResults(completedResults);
    
    // Save to localStorage
    const storedHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const newSession = {
      date: new Date().toISOString(),
      score: {
        correct: completedResults.filter((r) => r.isCorrect).length,
        total: completedResults.length,
      },
      results: completedResults,
    };
    localStorage.setItem('quizHistory', JSON.stringify([newSession, ...storedHistory]));
  };

  useEffect(() => {
    if (quizStatus === "answering" && quizWords.length > 0) {
      const currentWord = quizWords[currentWordIndex];
      if (quizMode === 'quiz' || quizMode === 'revision') {
        const generatedOptions = generateOptions(currentWord, words, quizType);
        setOptions(generatedOptions);
      }
    }
  }, [quizStatus, quizWords, currentWordIndex, words, quizType, quizMode]);

  // This useEffect is the core of the quiz progression logic
  useEffect(() => {
    if (quizStatus !== 'feedback' || quizMode === 'flashcards') return;

    const timer = setTimeout(() => {
      if (currentWordIndex < quizWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setSelectedAnswer(null);
        setTypingAttempts(0);
        setQuizStatus('answering');
      } else {
        setQuizStatus('complete');
        // Save history
        const storedHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
        const newSession = {
          date: new Date().toISOString(),
          score: {
            correct: quizResults.filter((r) => r.isCorrect).length,
            total: quizResults.length,
          },
          results: quizResults,
        };
        localStorage.setItem("quizHistory", JSON.stringify([newSession, ...storedHistory]));
      }
    }, 1200); // 1.2 second delay for feedback

    return () => clearTimeout(timer);
  }, [quizStatus, currentWordIndex, quizWords.length, quizResults, quizMode]);


  const startQuiz = () => {
    const totalWords = words ? words.length : 0;
    if (((quizMode === 'quiz' || quizMode === 'revision') && totalWords < 4) || (quizMode !== 'quiz' && quizMode !== 'revision' && totalWords < 1)) {
      setModalState({
        open: true,
        title: "Not Enough Words",
        message: `A ${quizMode} session requires at least ${(quizMode === 'quiz' || quizMode === 'revision') ? 4 : 1} words. You have ${totalWords}.`,
        type: "info",
      });
      return;
    }

    const actualQuizSize = Math.min(totalWords, quizLimit);
    let wordsForSession;
    if (quizMode === 'flashcards') {
      wordsForSession = getWordsForFlashcards(words, actualQuizSize);
    } else if (quizMode === 'revision') {
      wordsForSession = getWordsForRevisionChallenge(words, actualQuizSize);
    } else {
      wordsForSession = getWordsForQuiz(words, actualQuizSize);
    }
    
    setQuizWords(wordsForSession);
    setLastQuizWords(wordsForSession);
    setCurrentWordIndex(0);
    setQuizResults([]);
    setSelectedAnswer(null);
    setTypingAttempts(0);
    setTimeLeft(300); // Reset timer to 5:00
    setQuizStatus("answering");
  };

  const handleAnswer = (answer) => {
    if (quizStatus !== 'answering') return;

    const currentWord = quizWords[currentWordIndex];
    let isCorrect;
    let quality;

    if (quizMode === 'typing') {
      isCorrect = answer.trim().toLowerCase() === currentWord.word.toLowerCase();
      const newAttempts = typingAttempts + 1;
      setTypingAttempts(newAttempts);

      if (!isCorrect && newAttempts < 2) {
        setSelectedAnswer(answer); // Show feedback but don't advance
        return;
      }
      quality = isCorrect ? (newAttempts === 1 ? 5 : 4) : 0;
    } else { // 'quiz' or 'revision' mode
      isCorrect = quizType === 'wordToMeaning' ? answer === currentWord.meaning : answer === currentWord.word;
      quality = isCorrect ? 5 : 0;
    }

    // Set state for feedback
    setSelectedAnswer(answer);
    setQuizStatus('feedback');

    // Update word stats
    const { nextReview, easinessFactor, repetition, streak, isLearned } = sm2(currentWord, quality);
    updateWord(currentWord.id, {
      nextReview, easinessFactor, repetition, streak, isLearned,
      lastReviewed: new Date(),
      points: (currentWord.points || 0) + (isCorrect ? 10 : 0),
    });

    // Record results
    setQuizResults(prevResults => [...prevResults, { word: currentWord, selectedAnswer: answer, isCorrect }]);
  };

  const restartQuiz = () => {
    setQuizWords(lastQuizWords);
    setCurrentWordIndex(0);
    setQuizResults([]);
    setSelectedAnswer(null);
    setTypingAttempts(0);
    setTimeLeft(300); // Reset timer to 5:00
    setQuizStatus("answering");
  };

  const returnToSetup = () => {
    setQuizStatus("setup");
  };

  const handleNextFlashcard = () => {
    if (currentWordIndex < quizWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handlePreviousFlashcard = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  if (!words) {
    return <Box sx={{ display: "flex", justifyContent: "center" }}><CircularProgress /></Box>;
  }

  if (quizStatus === 'complete') {
    return (
      <Fade in>
        <Box>
          <QuizComplete
            results={quizResults}
            onRestart={restartQuiz}
            onReturn={returnToSetup}
            quizMode={quizMode}
          />
        </Box>
      </Fade>
    );
  }

  if (quizStatus === 'setup') {
    const totalWords = words.length;
    
    const quizModes = [
      {
        value: 'quiz',
        label: 'Quiz Mode',
        description: 'Test your knowledge with multiple choice questions',
        icon: <QuizIcon sx={{ fontSize: 32 }} />,
        color: '#007aff',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        value: 'flashcards',
        label: 'Flashcards',
        description: 'Review words at your own pace with interactive cards',
        icon: <FlashcardIcon sx={{ fontSize: 32 }} />,
        color: '#34c759',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        value: 'typing',
        label: 'Typing Challenge',
        description: 'Type the correct word to test your memory',
        icon: <TypingIcon sx={{ fontSize: 32 }} />,
        color: '#ff9500',
        bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        value: 'revision',
        label: 'Revision Challenge',
        description: 'Focus on words due for review with spaced repetition',
        icon: <RevisionIcon sx={{ fontSize: 32 }} />,
        color: '#ff3b30',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      }
    ];

    return (
      <Fade in>
        <Box>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 2
              }}
            >
              🧠 Quiz Arena
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Challenge yourself and master your vocabulary
            </Typography>
            <Chip 
              icon={<Star />} 
              label={`${totalWords} words ready`} 
              color="primary" 
              variant="outlined"
              sx={{ fontSize: '0.9rem', py: 2 }}
            />
          </Box>

          {/* Quiz Mode Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Choose Your Challenge
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              maxWidth: 800,
              mx: 'auto'
            }}>
              {quizModes.map((mode) => (
                <Zoom in key={mode.value} style={{ transitionDelay: `${quizModes.indexOf(mode) * 100}ms` }}>
                  <Card 
                    onClick={() => {
                      setSelectedQuizMode(mode.value);
                      setConfigModalOpen(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: 'scale(1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '2px solid transparent',
                      background: 'background.paper',
                      color: 'text.primary',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        border: '2px solid',
                        borderColor: mode.color,
                        background: 'action.hover',
                        color: 'text.primary'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {mode.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {mode.label}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {mode.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              ))}
            </Box>
          </Box>


          {/* Quiz History */}
          <Box sx={{ mt: 4 }}>
            <QuizHistory />
          </Box>
          
          {/* Configuration Modal */}
          <Modal
            open={configModalOpen}
            onClose={() => setConfigModalOpen(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              backdropFilter: 'blur(8px)'
            }}
          >
          <Paper
            sx={{
              maxWidth: 520,
              width: '100%',
              borderRadius: 4,
              p: 0,
              position: 'relative',
              background: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              color: 'text.primary',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5)',
              overflow: 'hidden'
            }}
          >
              {/* Header */}
              <Box sx={{ 
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1e1e1e 0%, #333 100%)' 
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                color: 'text.primary',
                p: 4,
                position: 'relative',
                textAlign: 'center',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`
              }}>
                <IconButton
                  onClick={() => setConfigModalOpen(false)}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    color: '#6c757d',
                    background: 'rgba(108, 117, 125, 0.1)',
                    '&:hover': {
                      background: 'rgba(108, 117, 125, 0.2)',
                      color: '#495057'
                    }
                  }}
                >
                  <Close />
                </IconButton>
                
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  Configure Your {quizModes.find(mode => mode.value === selectedQuizMode)?.label || 'Quiz'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Customize your learning experience
                </Typography>
              </Box>
              
              {/* Content */}
              <Box sx={{ p: 4 }}>
                {/* Number of Questions */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    📊 Number of Questions
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select 
                      value={tempQuizLimit} 
                      onChange={(e) => setTempQuizLimit(Number(e.target.value))}
                      sx={{
                        borderRadius: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          '&:hover': {
                            border: '1px solid #1976d2'
                          }
                        }
                      }}
                    >
                      {[5, 10, 15, 20, 25, 30].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} Questions
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                {/* Quiz Type Selection for quiz and revision modes */}
                {(selectedQuizMode === 'quiz' || selectedQuizMode === 'revision') && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      🎯 Question Direction
                    </Typography>
                    <ToggleButtonGroup 
                      value={tempQuizType} 
                      exclusive 
                      onChange={(e, newType) => newType && setTempQuizType(newType)}
                      fullWidth
                      sx={{
                        gap: 2,
                        '& .MuiToggleButton-root': {
                          px: 3,
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 600,
                          textTransform: 'none',
                          border: '1px solid #e9ecef',
                          background: '#f8f9fa',
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                            color: '#1976d2',
                            border: '1px solid #1976d2',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                              color: '#1976d2'
                            }
                          },
                          '&:hover': {
                            background: '#e9ecef',
                            border: '1px solid #adb5bd'
                          }
                        }
                      }}
                    >
                      <ToggleButton value="wordToMeaning">
                        <TrendingUp sx={{ mr: 1 }} />
                        Word → Meaning
                      </ToggleButton>
                      <ToggleButton value="meaningToWord">
                        <Bolt sx={{ mr: 1 }} />
                        Meaning → Word
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
                
                {/* Estimated Time */}
                <Box sx={{ 
                  mb: 4, 
                  textAlign: 'center', 
                  py: 3, 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  borderRadius: 3,
                  border: '1px solid #e1f5fe'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#1976d2' }}>
                    <Timer sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                    Estimated time: {Math.ceil(tempQuizLimit * 0.5)} minutes
                  </Typography>
                </Box>
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={() => setConfigModalOpen(false)}
                    sx={{
                      flex: 1,
                      py: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderColor: '#dee2e6',
                      color: '#6c757d',
                      background: '#f8f9fa',
                      '&:hover': {
                        borderColor: '#adb5bd',
                        background: '#e9ecef',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => {
                      setQuizMode(selectedQuizMode);
                      setQuizLimit(tempQuizLimit);
                      setQuizType(tempQuizType);
                      setConfigModalOpen(false);
                      // Start quiz immediately after configuration
                      setTimeout(() => {
                        const totalWords = words.length;
                        if (((selectedQuizMode === 'quiz' || selectedQuizMode === 'revision') && totalWords < 4) || (selectedQuizMode !== 'quiz' && selectedQuizMode !== 'revision' && totalWords < 1)) {
                          setModalState({
                            open: true,
                            title: "Not Enough Words",
                            message: `A ${selectedQuizMode} session requires at least ${(selectedQuizMode === 'quiz' || selectedQuizMode === 'revision') ? 4 : 1} words. You have ${totalWords}.`,
                            type: "info",
                          });
                          return;
                        }
                        startQuiz();
                      }, 100);
                    }}
                    disabled={((selectedQuizMode === 'quiz' || selectedQuizMode === 'revision') && totalWords < 4) || (selectedQuizMode !== 'quiz' && selectedQuizMode !== 'revision' && totalWords < 1)}
                    sx={{ 
                      flex: 2,
                      py: 2,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      boxShadow: '0 4px 16px rgba(79, 172, 254, 0.3)',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2196f3 0%, #00e5ff 100%)',
                        boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: 'rgba(0,0,0,0.12)',
                        transform: 'none'
                      }
                    }}
                    startIcon={<PlayCircle />}
                  >
                    {selectedQuizMode === 'quiz' || selectedQuizMode === 'revision' || selectedQuizMode === 'typing' ? 'Start Quiz' : 'Start Practice'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Modal>
          
          <InfoModal 
            open={modalState.open} 
            onClose={() => setModalState({ ...modalState, open: false })} 
            onConfirm={modalState.onConfirm} 
            title={modalState.title} 
            message={modalState.message} 
            type={modalState.type} 
          />
        </Box>
      </Fade>
    );
  }

  if (quizStatus === 'answering' || quizStatus === 'feedback') {
    const currentWord = quizWords[currentWordIndex];
    if (!currentWord) return null; // Should not happen, but a good guard

    // Format time for display
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <Fade in>
        <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, mb: 8 }}>
          {/* Timer Display - Only for quiz, typing, and revision modes */}
          {(quizMode === 'quiz' || quizMode === 'typing' || quizMode === 'revision') && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                background: timeLeft <= 60 ? 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                border: timeLeft <= 60 ? '1px solid #f44336' : '1px solid #1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Timer sx={{ 
                fontSize: 24, 
                color: timeLeft <= 60 ? '#d32f2f' : '#1976d2',
                animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: timeLeft <= 60 ? '#d32f2f' : '#1976d2',
                  fontFamily: 'monospace',
                  fontSize: '1.2rem'
                }}
              >
                {formatTime(timeLeft)}
              </Typography>
              {timeLeft <= 60 && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                  Time running out!
                </Typography>
              )}
            </Paper>
          )}
          {quizMode === 'flashcards' && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                mt: 4,
                borderRadius: 3,
                maxWidth: 600,
                width: "100%",
                mx: "auto",
                background: '#fefefe',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Flashcard word={currentWord} />
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, textAlign: 'center', color: '#2c3e50' }}>
                  Flashcard {currentWordIndex + 1} of {quizWords.length}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handlePreviousFlashcard}
                    disabled={currentWordIndex === 0}
                    sx={{
                      borderColor: '#3498db',
                      color: '#3498db',
                      '&:hover': {
                        borderColor: '#2980b9',
                        background: 'rgba(52, 152, 219, 0.1)'
                      }
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNextFlashcard}
                    disabled={currentWordIndex === quizWords.length - 1}
                    sx={{
                      background: '#3498db',
                      '&:hover': {
                        background: '#2980b9'
                      }
                    }}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            </Paper>
          )}
          {(quizMode === 'quiz' || quizMode === 'revision') && (
            <QuizMCQ
              currentWord={currentWord}
              options={options}
              isAnswered={quizStatus === 'feedback'}
              selectedAnswer={selectedAnswer}
              handleAnswer={handleAnswer}
              progress={((currentWordIndex + 1) / quizWords.length) * 100}
              currentQuestion={currentWordIndex + 1}
              totalQuestions={quizWords.length}
              quizType={quizType}
            />
          )}
          {quizMode === 'typing' && (
            <QuizTyping
              currentWord={currentWord}
              handleAnswer={handleAnswer}
              progress={((currentWordIndex + 1) / quizWords.length) * 100}
              currentQuestion={currentWordIndex + 1}
              totalQuestions={quizWords.length}
              isAnswered={quizStatus === 'feedback'}
              selectedAnswer={selectedAnswer}
              typingAttempts={typingAttempts}
            />
          )}
        </Box>
      </Fade>
    );
  }

  return null;
};

export default Quiz;