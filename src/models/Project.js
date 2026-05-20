import { Step } from './Step';

/**
 * Project is the abstract base. Direct use is allowed for lookups but the
 * domain expects every persisted project to be a GuidedProject or OpenProject.
 *
 * Status lifecycle: draft → review → published (or → rejected from review).
 */
export class Project {
  constructor({
    id,
    title,
    category,
    difficulty = 'Easy',
    duration = null,
    description = null,
    emoji = '🛠️',
    color = 'teal-img',
    creatorId = null,
    creatorName = null,
    status = 'draft',
    enrolled = 0,
    completion = 0,
    rating = 0,
    steps = [],
    coverUrl = null,
    createdAt = new Date().toISOString(),
    type = 'guided',
    stepCountHint = null,
  } = {}) {
    if (new.target === Project) {
      // Allow construction but encourage subclass use.
    }
    this._id = id;
    this._title = title;
    this._category = category;
    this._difficulty = difficulty;
    this._duration = duration;
    this._description = description;
    this._emoji = emoji;
    this._color = color;
    this._creatorId = creatorId;
    this._creatorName = creatorName;
    this._status = status;
    this._enrolled = enrolled;
    this._completion = completion;
    this._rating = rating;
    this._coverUrl = coverUrl;
    this._createdAt = createdAt;
    this._type = type;
    this._stepCountHint = stepCountHint;
    this._steps = (steps || []).map((s, i) => (s instanceof Step ? s : new Step({ ...s, n: s.n ?? i + 1 })));
    this._reviewerId = null;
    this._reviewNote = null;
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get id() { return this._id; }
  get title() { return this._title; }
  get category() { return this._category; }
  get difficulty() { return this._difficulty; }
  get duration() { return this._duration; }
  get description() { return this._description; }
  get emoji() { return this._emoji; }
  get color() { return this._color; }
  get creatorId() { return this._creatorId; }
  get creatorName() { return this._creatorName; }
  get status() { return this._status; }
  get enrolled() { return this._enrolled; }
  get completion() { return this._completion; }
  get rating() { return this._rating; }
  get coverUrl() { return this._coverUrl; }
  get createdAt() { return this._createdAt; }
  get type() { return this._type; }
  get steps() { return [...this._steps]; }
  get stepCount() { return this._steps.length || this._stepCountHint || 0; }
  get totalXp() { return this._steps.reduce((sum, s) => sum + (s.xp || 0), 0); }

  get isPublished() { return this._status === 'published'; }
  get isDraft() { return this._status === 'draft'; }
  get isInReview() { return this._status === 'review'; }
  get isRejected() { return this._status === 'rejected'; }

  // ── Mutators ─────────────────────────────────────────────────────────────
  setTitle(t) { if (t) this._title = String(t).trim(); }
  setCategory(c) { if (c) this._category = c; }
  setDifficulty(d) { if (d) this._difficulty = d; }
  setDuration(d) { this._duration = d || null; }
  setDescription(d) { this._description = d || null; }
  setEmoji(e) { this._emoji = e || '🛠️'; }
  setColor(c) { this._color = c || 'teal-img'; }
  setCoverUrl(url) { this._coverUrl = url || null; }

  setStatus(status, { reviewerId = null, note = null } = {}) {
    const allowed = ['draft', 'review', 'published', 'rejected'];
    if (!allowed.includes(status)) throw new Error(`Invalid project status: ${status}`);
    this._status = status;
    if (reviewerId) this._reviewerId = reviewerId;
    if (note) this._reviewNote = note;
  }

  addStep(stepProps) {
    const next = new Step({ ...stepProps, n: (this._steps.length || 0) + 1 });
    this._steps.push(next);
    return next;
  }

  removeStep(stepNumber) {
    const idx = this._steps.findIndex(s => s.n === stepNumber);
    if (idx === -1) return false;
    this._steps.splice(idx, 1);
    this._steps.forEach((s, i) => s.renumber(i + 1));
    return true;
  }

  updateStep(stepNumber, patch) {
    const step = this._steps.find(s => s.n === stepNumber);
    if (!step) return false;
    step.applyPatch(patch);
    return true;
  }

  // ── Behavior ─────────────────────────────────────────────────────────────
  /**
   * Whether a given user can enroll/start this project. Defaults to
   * "must be published and learner must not require parental consent for
   * hard projects". Subclasses can refine.
   */
  canBeStartedBy(user) {
    if (!user) return false;
    if (!this.isPublished) return false;
    if (!user.isLearner || !user.isLearner()) return false;
    if (typeof user.requiresParentalConsent === 'function' &&
        user.requiresParentalConsent() &&
        this._difficulty === 'Hard') {
      return false;
    }
    return true;
  }

  /** Subclasses override. */
  issuesCertificate() { return false; }

  /** Subclasses override; default returns the first not-yet-completed step. */
  nextStep(progress) {
    if (!progress) return this._steps[0] || null;
    const done = new Set(progress.completedStepNumbers);
    return this._steps.find(s => !done.has(s.n)) || null;
  }

  // ── Serialization ────────────────────────────────────────────────────────
  toRow() {
    return {
      id: this._id,
      title: this._title,
      category: this._category,
      difficulty: this._difficulty,
      duration: this._duration,
      description: this._description,
      emoji: this._emoji,
      color: this._color,
      creator_id: this._creatorId,
      creator_name: this._creatorName,
      status: this._status,
      enrolled: this._enrolled,
      completion: this._completion,
      rating: this._rating,
      cover_url: this._coverUrl,
      created_at: this._createdAt,
      type: this._type,
      step_count: this._steps.length || this._stepCountHint || 0,
    };
  }

  static fromRow(row, stepRows = []) {
    if (!row) return null;
    const { GuidedProject } = require('./GuidedProject');
    const { OpenProject } = require('./OpenProject');
    const props = {
      id: row.id,
      title: row.title,
      category: row.category,
      difficulty: row.difficulty,
      duration: row.duration,
      description: row.description,
      emoji: row.emoji,
      color: row.color,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      status: row.status,
      enrolled: row.enrolled,
      completion: row.completion,
      rating: row.rating,
      coverUrl: row.cover_url,
      createdAt: row.created_at,
      type: row.type,
      stepCountHint: row.step_count,
      steps: stepRows.map(s => Step.fromRow(s)),
    };
    return row.type === 'open' ? new OpenProject(props) : new GuidedProject(props);
  }
}
