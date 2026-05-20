import { Project } from './Project';

/**
 * GuidedProject: an ordered, step-by-step build. Steps must be completed in
 * order, XP is awarded per step, and a completion certificate is issued when
 * all steps are done.
 */
export class GuidedProject extends Project {
  constructor(props = {}) {
    super({ ...props, type: 'guided' });
  }

  issuesCertificate() { return true; }

  /** Step n is unlocked iff every step before it is completed. */
  isStepUnlocked(stepNumber, progress) {
    if (stepNumber === 1) return true;
    if (!progress) return false;
    const done = new Set(progress.completedStepNumbers);
    for (let i = 1; i < stepNumber; i++) {
      if (!done.has(i)) return false;
    }
    return true;
  }

  nextStep(progress) {
    if (!progress) return this.steps[0] || null;
    const done = new Set(progress.completedStepNumbers);
    return this.steps.find(s => !done.has(s.n)) || null;
  }

  /**
   * Computes the percentage progress for a given Progress instance,
   * factoring in the project's actual step count.
   */
  pctFor(progress) {
    if (!progress) return 0;
    const total = this.stepCount;
    if (total === 0) return 0;
    return Math.round((progress.completedStepNumbers.length / total) * 100);
  }

  /** Whether the progress represents full completion. */
  isCompletedBy(progress) {
    return progress && progress.completedStepNumbers.length >= this.stepCount && this.stepCount > 0;
  }
}
