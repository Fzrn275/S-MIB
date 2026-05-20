import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Resolve the Supabase URL + anon key from (in priority order):
 *   1. EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY env vars
 *      (recommended — these get inlined at build time by Metro)
 *   2. app.json `expo.extra.supabaseUrl` / `expo.extra.supabaseAnonKey`
 *      (useful for EAS Build secrets)
 *
 * If neither is set, we return null and the app runs in "offline-only" mode
 * (seed data only, no auth, no persistence). The smoke screen surfaces this.
 */
function resolveCredentials() {
  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { url: envUrl, key: envKey };

  const extra = Constants?.expoConfig?.extra || {};
  if (extra.supabaseUrl && extra.supabaseAnonKey) {
    return { url: extra.supabaseUrl, key: extra.supabaseAnonKey };
  }
  return null;
}

const creds = resolveCredentials();

/**
 * The shared Supabase client. Will be `null` if no credentials are configured;
 * callers must guard with `isSupabaseConfigured()` before using it.
 */
export const supabase = creds
  ? createClient(creds.url, creds.key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}

export function getSupabaseUrl() {
  return creds?.url || null;
}
