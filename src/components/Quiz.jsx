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
  InputLabel,
  Fade,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";
import QuizMCQ from "./quiz/QuizMCQ";
import QuizComplete from "./quiz/QuizComplete";
import QuizHistory from "./quiz/QuizHistory";
import Flashcard from "./Flashcard";
import InfoModal from "./InfoModal";
import QuizTyping from "./quiz/QuizTyping";

const Quiz = ({ onSessionStateChange }) => {
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

  // NEW State Management
  const [quizStatus, setQuizStatus] = useState("setup"); // 'setup', 'answering', 'feedback', 'complete'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typingAttempts, setTypingAttempts] = useState(0);

  useEffect(() => {
    if (onSessionStateChange) {
      onSessionStateChange(quizStatus !== "setup");
    }
  }, [quizStatus, onSessionStateChange]);

  useEffect(() => {
    if (quizStatus === "answering" && quizWords.length > 0) {
      const currentWord = quizWords[currentWordIndex];
      if (quizMode === 'quiz') {
        const generatedOptions = generateOptions(currentWord, words, quizType);
        setOptions(generatedOptions);
      }
    }
  }, [quizStatus, quizWords, currentWordIndex, words, quizType, quizMode]);

  // This useEffect is the core of the quiz progression logic
  useEffect(() => {
    if (quizStatus !== 'feedback' || quizMode === 'flashcards' || quizMode === 'revision') return;

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
    if ((quizMode === 'quiz' && totalWords < 4) || (quizMode !== 'quiz' && totalWords < 1)) {
      setModalState({
        open: true,
        title: "Not Enough Words",
        message: `A ${quizMode} session requires at least ${quizMode === 'quiz' ? 4 : 1} words. You have ${totalWords}.`,
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
    } else { // 'quiz' mode
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
    return (
      <Fade in>
        <Box>
          <Paper
            sx={{
              p: { xs: 3, sm: 5 }, // Increased padding
              borderRadius: 3, // More rounded corners
              textAlign: "center",
              maxWidth: 600, // Slightly wider
              width: "100%",
              mx: "auto",
              mt: 4, // Increased top margin
              mb: 6, // Increased bottom margin
              boxShadow: 6, // More prominent shadow
              bgcolor: "background.paper", // Ensure consistent background
            }}
            elevation={3}
          >
            <Typography variant="h5" gutterBottom>Start a New Session</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Select a mode and the number of words to practice.</Typography>
            <ToggleButtonGroup value={quizMode} exclusive onChange={(e, newMode) => newMode && setQuizMode(newMode)} aria-label="quiz mode" sx={{ mb: 4 }}>
              <ToggleButton value="quiz">Quiz</ToggleButton>
              <ToggleButton value="flashcards">Flashcards</ToggleButton>
              <ToggleButton value="typing">Typing</ToggleButton>
              <ToggleButton value="revision">Revision Challenge</ToggleButton>
            </ToggleButtonGroup>
            {(quizMode === 'quiz' || quizMode === 'revision') && (
              <ToggleButtonGroup value={quizType} exclusive onChange={(e, newType) => newType && setQuizType(newType)} aria-label="quiz type" sx={{ mb: 4 }} size="small">
                <ToggleButton value="wordToMeaning">Word → Meaning</ToggleButton>
                <ToggleButton value="meaningToWord">Meaning → Word</ToggleButton>
              </ToggleButtonGroup>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
              <FormControl variant="outlined" sx={{ minWidth: 150 }} disabled={totalWords === 0} size="small">
                <InputLabel id="quiz-limit-label">Questions</InputLabel>
                <Select labelId="quiz-limit-label" value={quizLimit} onChange={(e) => setQuizLimit(Number(e.target.value))} label="Questions">
                  {[5, 10, 15, 20, 25, 30].map((num) => <MenuItem key={num} value={num}>{num} Questions</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" size="large" onClick={startQuiz} startIcon={<PlayCircle />} disabled={(quizMode === 'quiz' && totalWords < 4) || (quizMode !== 'quiz' && totalWords < 1)} sx={{ px: 4, py: 1.5 }}>
                {quizMode === 'quiz' || quizMode === 'typing' ? 'Start Test' : 'Start Practice'}
              </Button>
            </Stack>
          </Paper>
          <QuizHistory />
          <InfoModal open={modalState.open} onClose={() => setModalState({ ...modalState, open: false })} onConfirm={modalState.onConfirm} title={modalState.title} message={modalState.message} type={modalState.type} />
        </Box>
      </Fade>
    );
  }

  if (quizStatus === 'answering' || quizStatus === 'feedback') {
    const currentWord = quizWords[currentWordIndex];
    if (!currentWord) return null; // Should not happen, but a good guard

    return (
      <Fade in>
        <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, mb: 8 }}>
          {quizMode === 'flashcards' && (
            <Paper
              sx={{
                p: { xs: 2, sm: 4 },
                mt: 4,
                borderRadius: 3,
                maxWidth: 600,
                width: "100%",
                mx: "auto",
                boxShadow: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              elevation={3}
            >
              <Flashcard word={currentWord} />
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                Flashcard {currentWordIndex + 1} of {quizWords.length}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handlePreviousFlashcard}
                  disabled={currentWordIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNextFlashcard}
                  disabled={currentWordIndex === quizWords.length - 1}
                >
                  Next
                </Button>
              </Stack>
            </Paper>
          )}
          {(quizMode === 'quiz' || quizMode === 'revision') && quizType !== 'typing' && (
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
          {(quizMode === 'quiz' || quizMode === 'revision') && quizType === 'typing' && (
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