import { Student } from './Student';

/**
 * SeniorLearner: Upper Secondary (Form 4-6, ages 16-18, SPM/STPM track). Full
 * difficulty access (including Hard) and more advanced category recommendations.
 * difficultyAccess() and recommendedCategories() are the polymorphic
 * counterparts to JuniorLearner's narrower band.
 */
export class SeniorLearner extends Student {
  constructor(props = {}) {
    super({ ...props, role: 'senior_learner' });
  }

  get roleLabel() { return 'Upper Secondary'; }

  /** Upper Secondary learners have full difficulty access, including Hard. */
  difficultyAccess() { return ['Easy', 'Medium', 'Hard']; }

  /** Whether the difficulty band is surfaced in the UI badge. */
  showsDifficulty() { return true; }

  /** Advanced categories, prioritized on the home rail. */
  recommendedCategories() { return ['Coding', 'Renewable', 'Physics', 'Biology']; }

  canRateSteps() { return true; }
}
