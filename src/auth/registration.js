/**
 * Pure registration logic — role resolution, role metadata, and building the
 * right User subclass from collected form data. No React / Supabase here so it
 * stays unit-testable (see src/auth/__regtest.js).
 */
import { JuniorLearner } from '../models/JuniorLearner';
import { SeniorLearner } from '../models/SeniorLearner';
import { Creator } from '../models/Creator';
import { Parent } from '../models/Parent';
import { colors } from '../theme/tokens';

const JUNIOR_GRADES = new Set(['Form 1', 'Form 2', 'Form 3']);
const SENIOR_GRADES = new Set(['Form 4', 'Form 5', 'Form 6']);

/**
 * Decide Junior vs Senior learner. In the Malaysian system, Form 1-3 (ages
 * 13-15, Lower Secondary / PT3 track) are Junior; Form 4-6 (ages 16-18, Upper
 * Secondary / SPM/STPM track) are Senior. This split drives content difficulty
 * and feature gating, not parental consent.
 */
export function resolveLearnerRole({ grade, age } = {}) {
  if (grade && JUNIOR_GRADES.has(grade)) return 'junior_learner';
  if (grade && SENIOR_GRADES.has(grade)) return 'senior_learner';
  const n = Number(age);
  // Age fallback when grade is absent: the boundary at 16 is the Lower→Upper
  // Secondary (Form 3 → Form 4) transition, NOT primary vs secondary. Default
  // to senior so the narrower Junior difficulty band is never applied by error.
  if (Number.isFinite(n) && n > 0) return n < 16 ? 'junior_learner' : 'senior_learner';
  return 'senior_learner';
}

/** Map the RegStep1 UI role ('learner' | 'creator' | 'parent') to a model role. */
export function resolveRole({ role, grade, age } = {}) {
  switch (role) {
    case 'learner':
      return resolveLearnerRole({ grade, age });
    case 'creator':
      return 'creator'; // unverified; verification is a later/admin step
    case 'parent':
      return 'parent';
    default:
      return 'user';
  }
}

/**
 * Per-UI-role presentation data shared by the role-select cards (RegStep1) and
 * the welcome screen (RegSuccess). Copy/icons ported from the web design's
 * `roles` + `perksByRole`; colors come from the theme tokens.
 */
export const roleMeta = {
  learner: {
    prefix: 'LRN',
    icon: '🎓',
    label: 'Learner',
    accent: colors.cyan,
    sub: 'I want to learn & build STEM projects',
    perks: [
      { icon: '🚀', title: 'Build hands-on STEM projects', sub: 'Robotics, coding, electronics & more' },
      { icon: '🏆', title: 'Earn XP, badges & certificates', sub: 'Level up as you complete projects' },
      { icon: '🤖', title: 'AI mentor available 24/7', sub: 'Get unstuck anytime, anywhere' },
    ],
    greeting: "You're all set!\nStart your maker journey today.",
    cta: 'Start Exploring →',
    idHint: 'Share this with your parent to link accounts',
  },
  creator: {
    prefix: 'CRT',
    icon: '🔧',
    label: 'Creator',
    accent: colors.yellow,
    sub: 'I create & publish learning projects',
    perks: [
      { icon: '✏️', title: 'Publish your own projects', sub: 'Reach thousands of learners across Sarawak' },
      { icon: '📊', title: 'Track student progress', sub: 'See engagement & completion analytics' },
      { icon: '🔧', title: 'Build your creator profile', sub: 'Ratings, reviews & direct feedback' },
    ],
    greeting: 'Welcome aboard!\nReady to inspire the next generation?',
    cta: 'Go to Dashboard →',
    idHint: 'Your unique creator identifier',
  },
  parent: {
    prefix: 'PRN',
    icon: '👨‍👩‍👧',
    label: 'Parent',
    accent: colors.green,
    sub: "I monitor my child's learning progress",
    perks: [
      { icon: '👀', title: "Monitor your child's journey", sub: 'Real-time progress & activity feed' },
      { icon: '🎯', title: 'Celebrate achievements', sub: 'Get notified for every milestone' },
      { icon: '🔒', title: 'Safe, supervised learning', sub: 'Vetted creators & age-appropriate content' },
    ],
    greeting: "You're connected!\nLet's support your child's STEM journey.",
    cta: 'View My Children →',
    idHint: "Ask your child for their LRN-XXXX ID to link them",
  },
};

/** Generate a display-only public ID for offline/demo mode (e.g. "LRN-4821"). */
export function makeOfflinePublicId(uiRole) {
  const prefix = (roleMeta[uiRole] || {}).prefix || 'USR';
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

/**
 * Build the correct User subclass from a resolved role + collected form data.
 * `role` is the *resolved* model role (e.g. 'junior_learner'), not the UI role.
 * Used by RegSuccess in offline mode and anywhere a local instance is needed.
 */
export function buildUserModel({ role, id, publicId, profile = {} }) {
  const base = {
    id,
    email: profile.email,
    displayName: profile.displayName,
    locale: profile.locale || 'en',
    publicId,
  };
  switch (role) {
    case 'junior_learner':
      return new JuniorLearner({ ...base, lrnId: publicId, schoolName: profile.schoolName, grade: profile.grade });
    case 'senior_learner':
      return new SeniorLearner({ ...base, lrnId: publicId, schoolName: profile.schoolName, grade: profile.grade });
    case 'creator':
      return new Creator({ ...base, crtId: publicId, organization: profile.organization, expertise: profile.expertise, bio: profile.bio || null });
    case 'parent':
      return new Parent({ ...base, prnId: publicId, phone: profile.phone, relationship: profile.relationship });
    default:
      throw new Error(`buildUserModel: unsupported role ${role}`);
  }
}

/**
 * Build the `options.data` payload for supabase.auth.signUp. Keys MUST match the
 * snake_case names read by the handle_new_user() SQL trigger (supabase/schema.sql).
 * `role` is the resolved model role. Omitted fields are left undefined.
 */
export function buildSignupMetadata(role, profile = {}) {
  return {
    role,
    display_name: profile.displayName,
    locale: profile.locale || 'en',
    school_name: profile.schoolName,
    grade: profile.grade,
    organization: profile.organization,
    expertise: profile.expertise,
    years_experience: profile.yearsExperience,
    phone: profile.phone,
    // NOTE: requires a profiles.relationship (text, nullable) column AND the
    // handle_new_user() trigger to read m->>'relationship'. Those DB/SQL changes
    // are applied separately; this layer just forwards the value.
    relationship: profile.relationship,
  };
}
