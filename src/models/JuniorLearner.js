import { Student } from './Student';

/**
 * JuniorLearner: under 13 / Form 1-3. Requires parental consent and gets a
 * stricter content filter. Cannot self-publish project ratings yet.
 */
export class JuniorLearner extends Student {
  constructor(props = {}) {
    super({ ...props, role: 'junior_learner' });
  }

  get roleLabel() { return 'Junior Learner'; }

  contentFilter() { return 'kid-safe'; }
  requiresParentalConsent() { return true; }

  /** Junior learners can't rate steps (gameable abuse vector). */
  canRateSteps() { return false; }

  /** Junior learners can earn certificates but the issuance is gated on parental consent. */
  canRequestCertificate() { return true; }
}
