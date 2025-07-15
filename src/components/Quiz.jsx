import React, { useState, useEffect } from "react";
import { useWords } from "../hooks/useWords";
import {
  getWordsForQuiz,
  getNextReviewDate,
  generateOptions,
  filterOldHistory,
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
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";
import QuizMCQ from "./quiz/QuizMCQ";
import QuizComplete from "./quiz/QuizComplete";
import QuizHistory from "./quiz/QuizHistory";
import InfoModal from "./InfoModal";

const Quiz = () => {
  const { words, updateWord } = useWords();
  const [quizWords, setQuizWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isQuizDataReady, setIsQuizDataReady] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [quizLimit, setQuizLimit] = useState(10);
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
  });

  // Fade transitions
  const [showMain, setShowMain] = useState(false);
  useEffect(() => {
    setShowMain(true);
  }, []);

  useEffect(() => {
    if (words !== undefined) setIsQuizDataReady(true);
  }, [words]);

  useEffect(() => {
    if (
      quizStarted &&
      quizWords.length > 0 &&
      currentWordIndex < quizWords.length
    ) {
      const currentWord = quizWords[currentWordIndex];
      const generatedOptions = generateOptions(currentWord, words);
      setOptions(generatedOptions);
    }
  }, [quizStarted, quizWords, currentWordIndex, words]);

  const proceedToStartQuiz = (wordsForQuiz) => {
    setQuizWords(wordsForQuiz);
    setCurrentWordIndex(0);
    setQuizResults([]);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setIsQuizComplete(false);
    setQuizStarted(true);
  };

  const startQuiz = () => {
    const totalWords = words ? words.length : 0;

    if (totalWords < 4) {
      setModalState({
        open: true,
        title: "Not Enough Words",
        message: `A quiz requires at least 4 words to generate options. You have ${totalWords}.`,
        type: "info",
      });
      return;
    }

    const actualQuizSize = Math.min(totalWords, quizLimit);
    const wordsForQuiz = getWordsForQuiz(words, actualQuizSize);

    if (totalWords < quizLimit) {
      setModalState({
        open: true,
        title: "Heads Up!",
        message: `You selected ${quizLimit} questions but only have ${totalWords}. The quiz will start with all ${totalWords} words.`,
        type: "confirm",
        onConfirm: () => {
          setModalState({ open: false });
          proceedToStartQuiz(wordsForQuiz);
        },
      });
    } else {
      proceedToStartQuiz(wordsForQuiz);
    }
  };

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    const currentWord = quizWords[currentWordIndex];
    const isCorrect = answer === currentWord.meaning;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const newResults = [
      ...quizResults,
      { word: currentWord, selectedAnswer: answer, isCorrect },
    ];
    setQuizResults(newResults);

    const newStreak = isCorrect ? (currentWord.streak || 0) + 1 : 0;
    const nextReviewDate = getNextReviewDate(newStreak);

    updateWord(currentWord.id, {
      streak: newStreak,
      lastReviewed: new Date(),
      nextReview: nextReviewDate,
      isLearned: newStreak >= 10,
    });

    setTimeout(() => {
      if (currentWordIndex < quizWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        setIsQuizComplete(true);
        setQuizStarted(false);

        // Save new session + remove history older than 30 days
        const storedHistory = JSON.parse(
          localStorage.getItem("quizHistory") || "[]"
        );
        const recentHistory = filterOldHistory(storedHistory, 30);
        const newSession = {
          date: new Date().toISOString(),
          score: {
            correct: newResults.filter((r) => r.isCorrect).length,
            total: newResults.length,
          },
          results: newResults,
        };
        localStorage.setItem(
          "quizHistory",
          JSON.stringify([newSession, ...recentHistory])
        );
      }
    }, 3200); // Extended feedback time to 3.2s
  };

  const restartQuiz = () => {
    setIsQuizComplete(false);
    startQuiz();
  };

  const returnToQuizSetup = () => {
    setIsQuizComplete(false);
  };

  // -- Render ---------------------------------------

  if (!isQuizDataReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isQuizComplete) {
    return (
      <Fade in={showMain}>
        <Box>
          <QuizComplete
            results={quizResults}
            onRestart={restartQuiz}
            onReturn={returnToQuizSetup}
          />
        </Box>
      </Fade>
    );
  }

  if (!quizStarted) {
    const totalWords = words ? words.length : 0;
    return (
      <Fade in={showMain}>
        <Box>
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              textAlign: "center",
              maxWidth: 500,
              mx: "auto",
              mt: 3,
              mb: 4,
            }}
            elevation={2}
          >
            <Typography variant="h5" gutterBottom>
              Start a New Quiz
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Select the number of questions and start the test.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <FormControl
                variant="outlined"
                sx={{ minWidth: 150 }}
                disabled={totalWords === 0}
                size="small"
              >
                <InputLabel id="quiz-limit-label">Questions</InputLabel>
                <Select
                  labelId="quiz-limit-label"
                  value={quizLimit}
                  onChange={(e) => setQuizLimit(Number(e.target.value))}
                  label="Questions"
                >
                  {[5, 10, 15, 20, 25, 30].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} Questions
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="large"
                onClick={startQuiz}
                startIcon={<PlayCircle />}
                disabled={totalWords < 4}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Test
              </Button>
            </Stack>
          </Paper>
          <QuizHistory />
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

  return (
    <Fade in={showMain}>
      <Box>
        <QuizMCQ
          currentWord={quizWords[currentWordIndex]}
          options={options}
          isAnswered={isAnswered}
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
          progress={((currentWordIndex + 1) / quizWords.length) * 100}
          currentQuestion={currentWordIndex + 1}
          totalQuestions={quizWords.length}
        />
      </Box>
    </Fade>
  );
};

export default Quiz;
