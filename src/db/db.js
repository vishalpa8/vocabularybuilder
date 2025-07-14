import Dexie from 'dexie';

export const db = new Dexie('vocabulary-builder');

db.version(1).stores({
  words: '++id, word, meaning, partOfSpeech, sampleSentence, tags, lastReviewed, nextReview, streak, isLearned, isFavorite, isDifficult, mnemonic',
});
