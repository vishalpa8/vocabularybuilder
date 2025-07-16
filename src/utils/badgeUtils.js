export const badgeCriteria = [
  {
    name: "First Step",
    description: "Add your first word.",
    condition: (words) => words.length >= 1,
  },
  {
    name: "Word Collector",
    description: "Add 10 words.",
    condition: (words) => words.length >= 10,
  },
  {
    name: "Dedicated Learner",
    description: "Complete a quiz for 3 consecutive days.",
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
  {
    name: "Quiz Whiz",
    description: "Score 100% on a quiz.",
    condition: () => {
      const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
      return history.some(item => (item.score / item.total) * 100 === 100);
    },
  },
  {
    name: "Word Master",
    description: "Learn 25 words.",
    condition: (words) => words.filter((word) => word.isLearned).length >= 25,
  },
];