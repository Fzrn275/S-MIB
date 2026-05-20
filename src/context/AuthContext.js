import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { User } from '../models';
import { buildSignupMetadata } from '../auth/registration';
import { computeReward } from '../data/reward';
import { keys } from '../data/localStore';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  configured: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  setLocalUser: () => {},
  signUpWithProfile: async () => ({ otpRequired: false }),
  verifyEmailOtp: async () => ({}),
  resendOtp: async () => {},
  fetchMyProfile: async () => null,
  resetPassword: async () => {},
  applyStepReward: async () => {},
});

const LOCAL_USER_KEY = 'smib.local.user';

/**
 * AuthProvider exposes the current session + a hydrated User model instance,
 * plus auth mutation functions. When Supabase isn't configured (no env vars),
 * we fall back to a local-only mode that persists a User instance in
 * AsyncStorage so the app remains demoable.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // ── Hydrate the profile (User subclass) for the current session ──────────
  const hydrateProfile = useCallback(async (sess) => {
    if (!sess?.user) {
      setUser(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sess.user.id)
      .maybeSingle();
    if (error) {
      console.warn('[auth] profile fetch failed:', error.message);
      setUser(null);
      return;
    }
    if (data) {
      setUser(User.fromRow(data));
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
    } else {
      // No profile row yet — likely mid-registration. Don't error.
      setUser(null);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    let unsub;

    async function init() {
      if (!configured) {
        // Local-only fallback: try to restore a stored user.
        try {
          const raw = await AsyncStorage.getItem(LOCAL_USER_KEY);
          if (raw) setUser(User.fromRow(JSON.parse(raw)));
        } catch (err) {
          console.warn('[auth] local restore failed:', err.message);
        }
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
      await hydrateProfile(data.session);
      setLoading(false);

      const sub = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        hydrateProfile(sess);
      });
      unsub = () => sub.data.subscription.unsubscribe();
    }

    init();
    return () => { if (unsub) unsub(); };
  }, [configured, hydrateProfile]);

  // ── Mutations ────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    if (!configured) throw new Error('Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, [configured]);

  // Start registration. Supabase: create the auth user (profile row is created
  // by the handle_new_user trigger from metadata) and send the OTP email.
  // Offline: no-op — the screens proceed through a stubbed OTP path.
  const signUpWithProfile = useCallback(async ({ email, password, role, profile }) => {
    if (!configured) return { otpRequired: false };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: buildSignupMetadata(role, profile) },
    });
    if (error) throw error;
    return { otpRequired: true };
  }, [configured]);

  // Confirm the 6-digit signup code. Offline: accepted by the caller.
  const verifyEmailOtp = useCallback(async ({ email, token }) => {
    if (!configured) return {};
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) throw error;
    return data;
  }, [configured]);

  const resendOtp = useCallback(async ({ email }) => {
    if (!configured) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, [configured]);

  // Read the current user's profile row (e.g. for the generated public_id).
  const fetchMyProfile = useCallback(async () => {
    if (!configured || !session?.user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }, [configured, session]);

  const resetPassword = useCallback(async (email) => {
    if (!configured) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, [configured]);

  const signOut = useCallback(async () => {
    if (configured) await supabase.auth.signOut();
    await AsyncStorage.removeItem(LOCAL_USER_KEY);
    setSession(null);
    setUser(null);
  }, [configured]);

  const refreshProfile = useCallback(async () => {
    if (session) await hydrateProfile(session);
  }, [session, hydrateProfile]);

  // Apply XP/level/streak after a step completion. Owns the user/profile.
  const applyStepReward = useCallback(async ({ xpDelta = 0 } = {}) => {
    if (!user || typeof user.isLearner !== 'function' || !user.isLearner()) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastKey = keys.lastActive(user.id);

    let lastActive = null;
    try { lastActive = await AsyncStorage.getItem(lastKey); } catch { /* ignore */ }

    const { userRow, lastActive: lastActiveNext } = computeReward({
      userRow: user.toRow(), xpDelta, lastActive, today,
    });

    const next = User.fromRow(userRow);
    setUser(next);

    try {
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userRow));
      if (lastActiveNext) await AsyncStorage.setItem(lastKey, lastActiveNext);
    } catch (err) {
      console.warn('[auth] reward local persist failed:', err.message);
    }

    if (configured && supabase && session?.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ xp: userRow.xp, level: userRow.level, streak: userRow.streak, last_active_on: lastActiveNext })
        .eq('id', user.id);
      if (error) console.warn('[auth] reward persist failed:', error.message);
    }
  }, [user, configured, session]);

  // Local-only setter used when Supabase isn't wired (demo mode).
  const setLocalUser = useCallback(async (userInstance) => {
    setUser(userInstance);
    if (userInstance && typeof userInstance.toRow === 'function') {
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userInstance.toRow()));
    }
  }, []);

  const value = useMemo(
    () => ({
      user, session, loading, configured,
      signIn, signOut, refreshProfile, setLocalUser,
      signUpWithProfile, verifyEmailOtp, resendOtp, fetchMyProfile, resetPassword,
      applyStepReward,
    }),
    [
      user, session, loading, configured,
      signIn, signOut, refreshProfile, setLocalUser,
      signUpWithProfile, verifyEmailOtp, resendOtp, fetchMyProfile, resetPassword,
      applyStepReward,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
