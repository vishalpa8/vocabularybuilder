import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useBadges() {
  const badges = useLiveQuery(() => db.badges.toArray(), []);

  const addBadge = async (badge) => {
    try {
      await db.badges.add(badge);
    } catch (error) {
      console.error('Failed to add badge:', error);
    }
  };

  return {
    badges,
    addBadge,
  };
}
