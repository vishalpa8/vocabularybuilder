import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useWords() {
  const words = useLiveQuery(() => db.words.toArray(), []);

  const addWord = async (word) => {
    try {
      await db.words.add(word);
    } catch (error) {
      console.error('Failed to add word:', error);
    }
  };

  const updateWord = async (id, updates) => {
    try {
      await db.words.update(id, updates);
    } catch (error) {
      console.error('Failed to update word:', error);
    }
  };

  const deleteWord = async (id) => {
    try {
      await db.words.delete(id);
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  };

  return {
    words,
    addWord,
    updateWord,
    deleteWord,
  };
}
