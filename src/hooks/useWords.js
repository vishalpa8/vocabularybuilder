import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useState, useCallback, useMemo } from 'react';

export function useWords() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const words = useLiveQuery(() => db.words.toArray(), []);

  // Shuffle the words to display them in random order
  const shuffledWords = useMemo(() => {
    if (!words) return [];
    const array = [...words];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [words]);

  const handleError = useCallback((error, operation) => {
    console.error(`Failed to ${operation}:`, error);
    setError({ operation, message: error.message });
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const addWord = useCallback(async (word) => {
    setLoading(true);
    setError(null);
    try {
      await db.words.add({
        ...word,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      handleError(error, 'add word');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateWord = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      await db.words.update(id, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      handleError(error, 'update word');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const deleteWord = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await db.words.delete(id);
    } catch (error) {
      handleError(error, 'delete word');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const bulkAddWords = useCallback(async (wordsArray) => {
    setLoading(true);
    setError(null);
    try {
      const wordsWithTimestamps = wordsArray.map(word => ({
        ...word,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.words.bulkAdd(wordsWithTimestamps);
    } catch (error) {
      handleError(error, 'bulk add words');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const clearError = useCallback(() => setError(null), []);

  return {
    words: shuffledWords,
    addWord,
    updateWord,
    deleteWord,
    bulkAddWords,
    loading,
    error,
    clearError,
  };
}
