import { Student } from './Student';

/**
 * JuniorLearner: Lower Secondary (Form 1-3, ages 13-15, PT3 track). Gets a
 * narrower difficulty band (no Hard projects) and beginner-friendly category
 * recommendations. The behavior is real: difficultyAccess() gates enrollment
 * (Project.canBeStartedBy) and the Explore filter; recommendedCategories()
 * orders the home "Explore New" rail.
 */
export class JuniorLearner extends Student {
  constructor(props = {}) {
    super({ ...props, role: 'junior_learner' });
  }

  get roleLabel() { return 'Lower Secondary'; }

  /** Lower Secondary learners can start Easy/Medium projects; Hard is locked. */
  difficultyAccess() { return ['Easy', 'Medium']; }

  /** Whether the difficulty band is surfaced in the UI badge. */
  showsDifficulty() { return true; }

  /** Beginner-friendly categories, prioritized on the home rail. */
  recommendedCategories() { return ['Electronics', 'Agriculture', 'Coding']; }

  canRateSteps() { return true; }
}
