// Spaced repetition intervals (in days)
const intervals = [1, 2, 4, 8, 16, 32];

export const getNextReviewDate = (streak) => {
  const now = new Date();
  const interval = intervals[Math.min(streak, intervals.length - 1)];
  now.setDate(now.getDate() + interval);
  return now;
};

export const getWordsForQuiz = (words, limit) => {
  if (!words || words.length === 0) return [];

  // Shuffle all words
  const shuffledWords = [...words].sort(() => 0.5 - Math.random());

  // Return the requested number of words
  return shuffledWords.slice(0, limit);
};

export const generateOptions = (correctWord, allWords) => {
  if (!correctWord || !allWords) return [];
  const options = [correctWord.meaning];
  const distractors = allWords
    .filter(word => word.id !== correctWord.id)
    .map(word => word.meaning);

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
