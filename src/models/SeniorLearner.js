import { Student } from './Student';

/**
 * SeniorLearner: Form 4+ / 13+. Full access to leaderboards and content.
 */
export class SeniorLearner extends Student {
  constructor(props = {}) {
    super({ ...props, role: 'senior_learner' });
  }

  get roleLabel() { return 'Senior Learner'; }

  contentFilter() { return 'standard'; }
  requiresParentalConsent() { return false; }
  canRateSteps() { return true; }

  /** Senior learners appear on the public leaderboard by default. */
  isLeaderboardOptedIn() { return true; }
}
