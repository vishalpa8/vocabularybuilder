// Spaced repetition intervals (in days) - Enhanced SM2 algorithm implementation
export const sm2 = (word, quality) => {
  let { easinessFactor, repetition, streak, repetitionCount } = word;

  // Initialize default values
  easinessFactor = easinessFactor || 2.5;
  repetition = repetition || 0;
  streak = streak || 0;
  repetitionCount = repetitionCount || 0;

  let nextRepetition;

  if (quality >= 3) { // Correct response
    streak += 1;
    repetitionCount += 1;
    
    // Calculate next repetition interval based on SM2 algorithm
    if (repetitionCount === 1) {
      nextRepetition = 1; // First review after 1 day
    } else if (repetitionCount === 2) {
      nextRepetition = 6; // Second review after 6 days
    } else {
      // For subsequent reviews, multiply previous interval by easiness factor
      nextRepetition = Math.round(repetition * easinessFactor);
    }
    
    repetition = nextRepetition;
  } else { // Incorrect response
    streak = 0;
    repetitionCount = 0; // Reset repetition count on failure
    repetition = 1; // Start over with 1 day interval
  }

  // Update easiness factor based on quality (SM2 formula)
  easinessFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + repetition);

  return {
    nextReview,
    easinessFactor,
    repetition,
    repetitionCount,
    streak,
    isLearned: streak >= 10,
  };
};


// quizUtils.js

/**
 * Filters out history entries older than N days.
 * @param {Array} history - Array of quiz session objects with a .date field.
 * @param {number} days - Number of days to keep history for (default 30).
 * @returns {Array} Filtered quiz history array.
 */
export function filterOldHistory(history, days = 30) {
  const now = new Date();
  return history.filter((entry) => {
    if (!entry.date) return false; // safety
    const entryDate = new Date(entry.date);
    const diffMs = now - entryDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  });
}

export const getWordsForQuiz = (words, limit) => {
  console.log("getWordsForQuiz called with:", { words, limit });
  if (!words || words.length === 0) return [];

  // Separate words into categories
  const now = new Date();
  const newWords = words.filter((word) => !word.lastReviewed);
  const dueForReview = words.filter(
    (word) => word.lastReviewed && !word.isLearned && new Date(word.nextReview) <= now
  );
  const notDue = words.filter(
    (word) => word.lastReviewed && !word.isLearned && new Date(word.nextReview) > now
  );
  const learned = words.filter((word) => word.isLearned);

  console.log("Categorized words:", { newWords, dueForReview, notDue, learned });

  // Prioritize new words, then due, then not-due, then learned
  let quizWords = [...newWords, ...dueForReview];

  if (quizWords.length < limit) {
    quizWords = [...quizWords, ...notDue];
  }
  if (quizWords.length < limit) {
    quizWords = [...quizWords, ...learned];
  }

  console.log("Combined quizWords before shuffle:", quizWords);

  // Shuffle the combined list and take the required number of words
  const shuffled = quizWords.sort(() => 0.5 - Math.random());
  
  // Ensure unique words
  const uniqueWords = Array.from(new Set(shuffled.map(w => w.id)))
    .map(id => shuffled.find(w => w.id === id));

  console.log("Final unique words:", uniqueWords.slice(0, limit));

  return uniqueWords.slice(0, limit);
};

export const getWordsForFlashcards = (words, limit) => {
  if (!words || words.length === 0) return [];

  // Shuffle all words and return the requested number
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};

export const getWordsForRevisionChallenge = (words, limit = 15) => {
  if (!words || words.length === 0) return [];

  const now = new Date();
  const maxWords = Math.min(limit, words.length);

  const newWords = words.filter((word) => !word.lastReviewed);
  const dueForReview = words.filter(
    (word) => word.lastReviewed && !word.isLearned && new Date(word.nextReview) <= now
  );
  const notDueUnlearned = words.filter(
    (word) => word.lastReviewed && !word.isLearned && new Date(word.nextReview) > now
  );
  const learned = words.filter((word) => word.isLearned);

  // Prioritize due words, then new words, then not-due, then learned
  const potentialWords = [
    ...dueForReview.sort(() => 0.5 - Math.random()),
    ...newWords.sort(() => 0.5 - Math.random()),
    ...notDueUnlearned.sort(() => 0.5 - Math.random()),
    ...learned.sort(() => 0.5 - Math.random())
  ];

  // Ensure unique words and take the limit
  const uniqueWords = Array.from(new Set(potentialWords.map(w => w.id)))
    .map(id => potentialWords.find(w => w.id === id));

  return uniqueWords.slice(0, maxWords);
};

export const generateOptions = (correctWord, allWords, type = 'wordToMeaning') => {
  if (!correctWord || !allWords) return [];

  const isWordToMeaning = type === 'wordToMeaning';
  const correctOption = isWordToMeaning ? correctWord.meaning : correctWord.word;
  const options = [correctOption];
  
  const distractors = allWords
    .filter((word) => word.id !== correctWord.id)
    .map((word) => isWordToMeaning ? word.meaning : word.word);

  // Shuffle distractors to get random ones
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }

  while (options.length < 4 && distractors.length > 0) {
    const distractor = distractors.pop();
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }

  // Shuffle the final options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
};