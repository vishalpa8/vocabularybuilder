export const badgeCriteria = [
  {
    name: "Word Collector",
    description: "Add your first 10 words.",
    condition: (words) => words.length >= 10,
  },
  {
    name: "Word Hoarder",
    description: "Add 50 words.",
    condition: (words) => words.length >= 50,
  },
  {
    name: "Word Master",
    description: "Master your first 10 words.",
    condition: (words) => words.filter((word) => word.isLearned).length >= 10,
  },
  {
    name: "Point Collector",
    description: "Earn 1000 points.",
    condition: (words) =>
      words.reduce((acc, word) => acc + (word.points || 0), 0) >= 1000,
  },
  {
    name: "Daily Reviser",
    description: "Revise words for 3 consecutive days.",
    condition: () => {
      const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
      if (history.length < 3) return false;

      const dates = history.map(item => new Date(item.date).setHours(0, 0, 0, 0));
      const uniqueDates = [...new Set(dates)];
      uniqueDates.sort((a, b) => b - a);

      if (uniqueDates.length < 3) return false;

      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);
      const twoDaysAgo = new Date(today).setDate(new Date(today).getDate() - 2);

      return uniqueDates.includes(today) && uniqueDates.includes(yesterday) && uniqueDates.includes(twoDaysAgo);
    },
  },
];