// Spaced repetition intervals (in days) - SM2 algorithm implementation
export const sm2 = (word, quality) => {
  let { easinessFactor, repetition, streak } = word;

  easinessFactor = easinessFactor || 2.5;
  repetition = repetition || 0;
  streak = streak || 0;

  if (quality >= 3) { // Correct response
    if (repetition === 0) {
      streak += 1;
      repetition = 1;
    } else if (repetition === 1) {
      streak += 1;
      repetition = 6;
    } else {
      streak += 1;
      repetition *= easinessFactor;
    }
  } else { // Incorrect response
    streak = 0;
    repetition = 0;
  }

  easinessFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + repetition);

  return {
    nextReview,
    easinessFactor,
    repetition,
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
  if (!words || words.length === 0) return [];

  // Separate words into categories
  const now = new Date();
  const dueForReview = words.filter(
    (word) => !word.isLearned && new Date(word.nextReview) <= now
  );
  const notDue = words.filter(
    (word) => !word.isLearned && new Date(word.nextReview) > now
  );
  const learned = words.filter((word) => word.isLearned);

  // Prioritize due words, then not-due, then learned words
  let quizWords = [...dueForReview];

  if (quizWords.length < limit) {
    quizWords = [...quizWords, ...notDue];
  }
  if (quizWords.length < limit) {
    quizWords = [...quizWords, ...learned];
  }

  // Shuffle the combined list and take the required number of words
  const shuffled = quizWords.sort(() => 0.5 - Math.random());
  
  // Ensure unique words
  const uniqueWords = Array.from(new Set(shuffled.map(w => w.id)))
    .map(id => shuffled.find(w => w.id === id));

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

  // 1. Prioritize words due for review (not learned and nextReview <= today)
  let dueForReview = words.filter(
    (word) => !word.isLearned && new Date(word.nextReview) <= now
  );

  // Shuffle due words to ensure randomness if more are available than needed
  dueForReview = dueForReview.sort(() => 0.5 - Math.random());

  let selectedWords = dueForReview.slice(0, maxWords);

  // 2. If not enough due words, fill with unlearned words not yet due
  if (selectedWords.length < maxWords) {
    const notDueUnlearned = words.filter(
      (word) => !word.isLearled && new Date(word.nextReview) > now && !selectedWords.some(sw => sw.id === word.id)
    );
    const shuffledNotDue = notDueUnlearned.sort(() => 0.5 - Math.random());
    const needed = maxWords - selectedWords.length;
    selectedWords = [...selectedWords, ...shuffledNotDue.slice(0, needed)];
  }

  // 3. If still not enough, fill with any remaining words (e.g., learned words, if necessary)
  if (selectedWords.length < maxWords) {
    const remainingWords = words.filter(
      (word) => !selectedWords.some(sw => sw.id === word.id)
    );
    const shuffledRemaining = remainingWords.sort(() => 0.5 - Math.random());
    const needed = maxWords - selectedWords.length;
    selectedWords = [...selectedWords, ...shuffledRemaining.slice(0, needed)];
  }

  // Final shuffle to mix prioritized and filled words
  return selectedWords.sort(() => 0.5 - Math.random());
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