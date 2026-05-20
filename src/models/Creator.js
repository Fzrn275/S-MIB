import { User } from './User';

/**
 * Creator: an unverified content author. Can author projects and submit them
 * for review but cannot publish directly. Subclasses unlock more permissions.
 */
export class Creator extends User {
  constructor({
    organization = null,
    bio = null,
    expertise = null,
    crtId = null,
    rating = 0,
    ...userProps
  } = {}) {
    super({ ...userProps, role: userProps.role || 'creator' });
    this._organization = organization;
    this._bio = bio;
    this._expertise = expertise;
    this._crtId = crtId;
    this._rating = rating;
  }

  get rolePrefix() { return 'CRT'; }
  get roleLabel() { return 'Creator'; }

  get organization() { return this._organization; }
  get bio() { return this._bio; }
  get expertise() { return this._expertise; }
  get crtId() { return this._crtId || this.publicId; }
  get rating() { return this._rating; }

  setBio(bio) { this._bio = bio || null; }
  setExpertise(exp) { this._expertise = exp || null; }
  setOrganization(org) { this._organization = org || null; }

  /** Base creators must go through review. */
  canPublishDirectly() { return false; }

  /** Base creators cannot review other creators' work. */
  canReviewSubmission() { return false; }

  /**
   * Returns the next project status after a save action.
   *   draft -> review (when canPublishDirectly is false)
   *   draft -> published (when canPublishDirectly is true; see VerifiedCreator)
   */
  intendedPublishStatus() {
    return this.canPublishDirectly() ? 'published' : 'review';
  }

  toRow() {
    return {
      ...super.toRow(),
      public_id: this._crtId,
      organization: this._organization,
      bio: this._bio,
      expertise: this._expertise,
      rating: this._rating,
    };
  }
}
