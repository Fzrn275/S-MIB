import { User } from './User';

/** XP thresholds for each level. Index 0 = Level 1 (no XP needed). */
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];

export const LEVEL_TITLES = [
  'Newcomer',
  'Builder',
  'Maker Novice',
  'Maker Apprentice',
  'Maker Apprentice',
  'Maker',
  'Maker Pro',
  'Innovator',
  'Inventor',
  'Master Maker',
  'Legend',
];

/**
 * Student is the abstract-ish parent for learners. Direct instantiation is
 * allowed for repos that haven't yet decided junior vs senior, but the app
 * should prefer JuniorLearner / SeniorLearner.
 */
export class Student extends User {
  constructor({
    schoolName = null,
    grade = null,
    lrnId = null,
    xp = 0,
    level = 1,
    streak = 0,
    ...userProps
  } = {}) {
    super({ ...userProps, role: userProps.role || 'senior_learner' });
    this._schoolName = schoolName;
    this._grade = grade;
    this._lrnId = lrnId;
    this._xp = xp;
    this._level = level;
    this._streak = streak;
  }

  get rolePrefix() { return 'LRN'; }
  get roleLabel() { return 'Learner'; }

  get schoolName() { return this._schoolName; }
  get grade() { return this._grade; }
  get lrnId() { return this._lrnId || this.publicId; }
  get xp() { return this._xp; }
  get level() { return this._level; }
  get streak() { return this._streak; }
  get rankTitle() {
    const idx = Math.max(0, Math.min(this._level - 1, LEVEL_TITLES.length - 1));
    return LEVEL_TITLES[idx];
  }

  get xpForCurrentLevel() {
    return LEVEL_THRESHOLDS[Math.min(this._level - 1, LEVEL_THRESHOLDS.length - 1)] || 0;
  }

  get xpForNextLevel() {
    return LEVEL_THRESHOLDS[Math.min(this._level, LEVEL_THRESHOLDS.length - 1)] || this._xp;
  }

  get xpToNextLevel() {
    return Math.max(0, this.xpForNextLevel - this._xp);
  }

  get levelProgressPct() {
    const span = this.xpForNextLevel - this.xpForCurrentLevel;
    if (span <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((this._xp - this.xpForCurrentLevel) / span) * 100)));
  }

  /** Add XP and advance level if thresholds are crossed. Returns the level delta. */
  addXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    this._xp += amount;
    let levelDelta = 0;
    while (
      this._level < LEVEL_THRESHOLDS.length &&
      this._xp >= LEVEL_THRESHOLDS[this._level]
    ) {
      this._level += 1;
      levelDelta += 1;
    }
    return levelDelta;
  }

  /** Mark today as a streak day; if a day was skipped, reset to 1. */
  bumpStreak(skipped = false) {
    this._streak = skipped ? 1 : this._streak + 1;
    return this._streak;
  }

  /** Subclasses override to gate content. Base returns 'standard'. */
  contentFilter() { return 'standard'; }

  /** Subclasses override. Base: always true. */
  canRequestCertificate() { return true; }

  /** Subclasses override. Base: false. */
  requiresParentalConsent() { return false; }

  canEnrollIn(project) {
    if (!project || typeof project.canBeStartedBy !== 'function') return false;
    return project.canBeStartedBy(this);
  }

  toRow() {
    return {
      ...super.toRow(),
      public_id: this._lrnId,
      school_name: this._schoolName,
      grade: this._grade,
      xp: this._xp,
      level: this._level,
      streak: this._streak,
    };
  }
}
