import { Creator } from './Creator';

/**
 * VerifiedCreator: a creator whose identity and quality have been verified.
 * Can publish directly without admin review.
 */
export class VerifiedCreator extends Creator {
  constructor(props = {}) {
    super({ ...props, role: props.role || 'verified_creator' });
  }

  get roleLabel() { return 'Verified Creator'; }

  canPublishDirectly() { return true; }
  isVerified() { return true; }
}
