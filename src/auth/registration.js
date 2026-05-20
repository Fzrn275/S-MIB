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
 * Decide junior vs senior learner. Form 1-3 (or, when grade is absent, age < 16)
 * is a junior; everything else defaults to senior so the parental-consent gate
 * is never falsely applied.
 */
export function resolveLearnerRole({ grade, age } = {}) {
  if (grade && JUNIOR_GRADES.has(grade)) return 'junior_learner';
  if (grade && SENIOR_GRADES.has(grade)) return 'senior_learner';
  const n = Number(age);
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
