/**
 * Progress: per-(user, project) state. Tracks completed step numbers, total
 * XP earned in this project, and the timestamp of the last activity.
 */
export class Progress {
  constructor({
    id = null,
    userId,
    projectId,
    completedStepNumbers = [],
    xpEarned = 0,
    lastStepAt = null,
    isBookmarked = false,
    isManuallyCompleted = false,
    stepProofs = {}, // { [stepN]: { uri, uploadedAt } }
    stepRatings = {}, // { [stepN]: 1..5 }
  } = {}) {
    if (!userId) throw new Error('Progress.userId required');
    if (!projectId) throw new Error('Progress.projectId required');
    this._id = id;
    this._userId = userId;
    this._projectId = projectId;
    this._completedStepNumbers = Array.isArray(completedStepNumbers)
      ? [...new Set(completedStepNumbers)].sort((a, b) => a - b)
      : [];
    this._xpEarned = xpEarned;
    this._lastStepAt = lastStepAt;
    this._isBookmarked = Boolean(isBookmarked);
    this._isManuallyCompleted = Boolean(isManuallyCompleted);
    this._stepProofs = { ...(stepProofs || {}) };
    this._stepRatings = { ...(stepRatings || {}) };
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get id() { return this._id; }
  get userId() { return this._userId; }
  get projectId() { return this._projectId; }
  get completedStepNumbers() { return [...this._completedStepNumbers]; }
  get xpEarned() { return this._xpEarned; }
  get lastStepAt() { return this._lastStepAt; }
  get isBookmarked() { return this._isBookmarked; }
  get isManuallyCompleted() { return this._isManuallyCompleted; }
  get stepProofs() { return { ...this._stepProofs }; }
  get stepRatings() { return { ...this._stepRatings }; }

  // ── Behavior ─────────────────────────────────────────────────────────────
  isStepDone(n) { return this._completedStepNumbers.includes(n); }

  pctOf(totalSteps) {
    if (!totalSteps || totalSteps <= 0) return 0;
    return Math.round((this._completedStepNumbers.length / totalSteps) * 100);
  }

  isComplete(totalSteps) {
    return totalSteps > 0 && this._completedStepNumbers.length >= totalSteps;
  }

  /**
   * Mark a step as completed. Returns the XP delta actually applied
   * (zero if the step was already completed).
   */
  completeStep(n, xp = 0, { proofUri = null } = {}) {
    if (!Number.isInteger(n) || n < 1) throw new Error('Step number must be positive');
    if (this._completedStepNumbers.includes(n)) return 0;
    this._completedStepNumbers.push(n);
    this._completedStepNumbers.sort((a, b) => a - b);
    this._xpEarned += xp || 0;
    this._lastStepAt = new Date().toISOString();
    if (proofUri) this._stepProofs[n] = { uri: proofUri, uploadedAt: this._lastStepAt };
    return xp || 0;
  }

  /** Idempotently un-complete a step (used when a creator removes a step). */
  uncompleteStep(n) {
    const idx = this._completedStepNumbers.indexOf(n);
    if (idx === -1) return false;
    this._completedStepNumbers.splice(idx, 1);
    delete this._stepProofs[n];
    delete this._stepRatings[n];
    return true;
  }

  rateStep(n, stars) {
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new Error('stars must be 1..5');
    }
    this._stepRatings[n] = stars;
  }

  setBookmarked(value) { this._isBookmarked = Boolean(value); }
  setManuallyCompleted(value) { this._isManuallyCompleted = Boolean(value); }

  // ── Serialization ────────────────────────────────────────────────────────
  toRow() {
    return {
      id: this._id,
      user_id: this._userId,
      project_id: this._projectId,
      completed_step_numbers: this._completedStepNumbers,
      xp_earned: this._xpEarned,
      last_step_at: this._lastStepAt,
      is_bookmarked: this._isBookmarked,
      is_manually_completed: this._isManuallyCompleted,
      step_proofs: this._stepProofs,
      step_ratings: this._stepRatings,
    };
  }

  static fromRow(row) {
    if (!row) return null;
    return new Progress({
      id: row.id,
      userId: row.user_id,
      projectId: row.project_id,
      completedStepNumbers: row.completed_step_numbers || [],
      xpEarned: row.xp_earned || 0,
      lastStepAt: row.last_step_at,
      isBookmarked: row.is_bookmarked,
      isManuallyCompleted: row.is_manually_completed,
      stepProofs: row.step_proofs || {},
      stepRatings: row.step_ratings || {},
    });
  }
}
