import Dexie from 'dexie';

export const db = new Dexie('vocabulary-builder');

// Latest version with optimized indexes and timestamps
db.version(6).stores({
  words: '++id, word, meaning, partOfSpeech, [tags+isFavorite], lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic, points, easinessFactor, repetition, [isLearned+nextReview], createdAt, updatedAt',
  user: '++id, totalPoints',
  badges: '++id, name, description, dateEarned',
  quizHistory: '++id, date, score, results',
}).upgrade(tx => {
  return tx.table('words').toCollection().modify(word => {
    if (word.easinessFactor === undefined) {
      word.easinessFactor = 2.5;
    }
    if (word.repetition === undefined) {
      word.repetition = 0;
    }
    if (word.createdAt === undefined) {
      word.createdAt = new Date();
    }
    if (word.updatedAt === undefined) {
      word.updatedAt = new Date();
    }
  });
});

db.version(5).stores({
  words: '++id, word, meaning, partOfSpeech, [tags+isFavorite], lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic, points, easinessFactor, repetition, [isLearned+nextReview]',
  user: '++id, totalPoints',
  badges: '++id, name, description, dateEarned',
  quizHistory: '++id, date, score, results',
}).upgrade(tx => {
  return tx.table('words').toCollection().modify(word => {
    if (word.easinessFactor === undefined) {
      word.easinessFactor = 2.5;
    }
    if (word.repetition === undefined) {
      word.repetition = 0;
    }
  });
});

db.version(4).stores({
  words: '++id, word, meaning, partOfSpeech, sampleSentence, tags, lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic, points, easinessFactor, repetition',
  user: '++id, totalPoints',
  badges: '++id, name, description, dateEarned',
}).upgrade(tx => {
  return tx.table('words').toCollection().modify(word => {
    if (word.easinessFactor === undefined) {
      word.easinessFactor = 2.5;
    }
    if (word.repetition === undefined) {
      word.repetition = 0;
    }
  });
});

db.version(3).stores({
  words: '++id, word, meaning, partOfSpeech, sampleSentence, tags, lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic, points',
  user: '++id, totalPoints',
  badges: '++id, name, description, dateEarned',
}).upgrade(tx => {
    return tx.table('words').toCollection().modify(word => {
        if(word.points === undefined) {
            word.points = 0;
        }
    });
});

db.version(2).stores({
  words: '++id, word, meaning, partOfSpeech, sampleSentence, tags, lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic, points',
  user: '++id, totalPoints',
}).upgrade(tx => {
  return tx.table('words').toCollection().modify(word => {
    word.points = 0;
  });
});

db.version(1).stores({
  words: '++id, word, meaning, partOfSpeech, sampleSentence, tags, lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic',
});
