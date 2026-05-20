import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin JSON wrapper over a key/value store. `backing` defaults to AsyncStorage
 * but tests inject an in-memory shim implementing getItem/setItem/removeItem.
 */
export function makeLocalStore(backing = AsyncStorage) {
  return {
    async getJSON(key, fallback = null) {
      try {
        const raw = await backing.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    async setJSON(key, value) {
      await backing.setItem(key, JSON.stringify(value));
    },
    async remove(key) {
      await backing.removeItem(key);
    },
  };
}

export const localStore = makeLocalStore();

export const keys = {
  progress: (userId) => `smib.progress.${userId}`,
  certs: (userId) => `smib.certs.${userId}`,
  lastActive: (userId) => `smib.lastActive.${userId}`,
};
