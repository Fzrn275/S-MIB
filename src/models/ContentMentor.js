import { VerifiedCreator } from './VerifiedCreator';

/**
 * ContentMentor: a verified creator with the additional power to review
 * submissions from other creators.
 */
export class ContentMentor extends VerifiedCreator {
  constructor(props = {}) {
    super({ ...props, role: 'content_mentor' });
  }

  get rolePrefix() { return 'MEN'; }
  get roleLabel() { return 'Content Mentor'; }

  canReviewSubmission() { return true; }

  /**
   * Apply a review decision to a project (mutates the passed project).
   * `decision` is one of: 'approve' | 'reject' | 'changes-requested'.
   * Returns the new project status.
   */
  reviewSubmission(project, decision, note = null) {
    if (!project || typeof project.setStatus !== 'function') {
      throw new Error('reviewSubmission requires a Project instance');
    }
    if (!this.canReviewSubmission()) {
      throw new Error('This account cannot review submissions');
    }
    const map = {
      approve: 'published',
      reject: 'rejected',
      'changes-requested': 'draft',
    };
    const next = map[decision];
    if (!next) throw new Error(`Unknown review decision: ${decision}`);
    project.setStatus(next, { reviewerId: this.id, note });
    return next;
  }
}
