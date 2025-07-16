import Dexie from 'dexie';

export const db = new Dexie('vocabulary-builder');

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
