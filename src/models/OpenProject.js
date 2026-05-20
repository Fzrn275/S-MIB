import { Project } from './Project';

/**
 * OpenProject: a free-form build with no enforced step order and no
 * automatic certificate. Steps act as optional milestones the learner can
 * complete in any order.
 */
export class OpenProject extends Project {
  constructor(props = {}) {
    super({ ...props, type: 'open' });
  }

  issuesCertificate() { return false; }

  /** All steps are always unlocked. */
  isStepUnlocked() { return true; }

  /** Open projects have no inherent next step. */
  nextStep() { return null; }

  /** Open-project pct counts how many optional milestones the learner hit. */
  pctFor(progress) {
    if (!progress || this.stepCount === 0) return 0;
    return Math.round((progress.completedStepNumbers.length / this.stepCount) * 100);
  }

  /** Completion is when the learner manually marks done; never automatic. */
  isCompletedBy(progress) {
    return Boolean(progress && progress.isManuallyCompleted);
  }
}
