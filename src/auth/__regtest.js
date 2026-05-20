/**
 * Runtime self-test of the registration logic layer (src/auth/registration.js).
 * Mirrors src/models/__smoketest.js. Returns { ok, results }.
 *
 * Run headlessly with `npm test auth`, or view it on the Login screen badge.
 */
import {
  resolveLearnerRole,
  resolveRole,
  roleMeta,
  makeOfflinePublicId,
  buildUserModel,
} from './registration';
import { User } from '../models';

function check(name, fn, results) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (err) {
    results.push({ name, ok: false, error: err.message || String(err) });
  }
}

export function runAuthSmokeTest() {
  const r = [];

  check('resolveLearnerRole: Form 1-3 -> junior, Form 4-6 -> senior', () => {
    if (resolveLearnerRole({ grade: 'Form 2' }) !== 'junior_learner') throw new Error('Form 2');
    if (resolveLearnerRole({ grade: 'Form 4' }) !== 'senior_learner') throw new Error('Form 4');
  }, r);

  check('resolveLearnerRole: age fallback + safe default', () => {
    if (resolveLearnerRole({ age: 12 }) !== 'junior_learner') throw new Error('age 12');
    if (resolveLearnerRole({ age: 17 }) !== 'senior_learner') throw new Error('age 17');
    if (resolveLearnerRole({}) !== 'senior_learner') throw new Error('empty default');
  }, r);

  check('resolveRole: maps UI role to final role', () => {
    if (resolveRole({ role: 'learner', grade: 'Form 1' }) !== 'junior_learner') throw new Error('learner');
    if (resolveRole({ role: 'creator' }) !== 'creator') throw new Error('creator');
    if (resolveRole({ role: 'parent' }) !== 'parent') throw new Error('parent');
  }, r);

  check('roleMeta: prefixes and perks for each UI role', () => {
    if (roleMeta.learner.prefix !== 'LRN') throw new Error('LRN');
    if (roleMeta.creator.prefix !== 'CRT') throw new Error('CRT');
    if (roleMeta.parent.prefix !== 'PRN') throw new Error('PRN');
    if (roleMeta.learner.perks.length !== 3) throw new Error('learner perks');
    if (roleMeta.parent.perks.length !== 3) throw new Error('parent perks');
  }, r);

  check('makeOfflinePublicId: prefix + 4 digits', () => {
    if (!/^LRN-\d{4}$/.test(makeOfflinePublicId('learner'))) throw new Error('learner id');
    if (!/^CRT-\d{4}$/.test(makeOfflinePublicId('creator'))) throw new Error('creator id');
    if (!/^PRN-\d{4}$/.test(makeOfflinePublicId('parent'))) throw new Error('parent id');
  }, r);

  const ok = r.every((x) => x.ok);
  return { ok, results: r };
}
