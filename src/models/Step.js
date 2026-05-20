import { Material } from './Material';

/**
 * Step: a single unit of work in a Project. Has instructions, an optional
 * tip, a list of Materials, an XP reward, and an optional video URL.
 */
export class Step {
  constructor({
    n,
    title,
    instruction = '',
    tip = null,
    materials = [],
    xp = 0,
    videoUrl = null,
    proofRequired = true,
  } = {}) {
    if (!Number.isInteger(n) || n < 1) {
      throw new Error('Step.n must be a positive integer');
    }
    if (!title) throw new Error('Step.title required');
    this._n = n;
    this._title = title;
    this._instruction = instruction;
    this._tip = tip;
    this._materials = (materials || []).map(m =>
      m instanceof Material ? m : new Material(typeof m === 'string' ? { name: m } : m)
    );
    this._xp = xp;
    this._videoUrl = videoUrl;
    this._proofRequired = proofRequired;
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get n() { return this._n; }
  get title() { return this._title; }
  get instruction() { return this._instruction; }
  get tip() { return this._tip; }
  get materials() { return [...this._materials]; }
  get xp() { return this._xp; }
  get videoUrl() { return this._videoUrl; }
  get proofRequired() { return this._proofRequired; }

  // ── Mutators (controlled) ────────────────────────────────────────────────
  renumber(n) {
    if (!Number.isInteger(n) || n < 1) throw new Error('renumber: n must be positive');
    this._n = n;
  }

  applyPatch({ title, instruction, tip, materials, xp, videoUrl, proofRequired } = {}) {
    if (title !== undefined) this._title = title;
    if (instruction !== undefined) this._instruction = instruction;
    if (tip !== undefined) this._tip = tip;
    if (xp !== undefined) this._xp = xp;
    if (videoUrl !== undefined) this._videoUrl = videoUrl;
    if (proofRequired !== undefined) this._proofRequired = proofRequired;
    if (Array.isArray(materials)) {
      this._materials = materials.map(m =>
        m instanceof Material ? m : new Material(typeof m === 'string' ? { name: m } : m)
      );
    }
  }

  // ── Behavior ─────────────────────────────────────────────────────────────
  isUnlockedFor(project, progress) {
    if (!project || typeof project.isStepUnlocked !== 'function') return true;
    return project.isStepUnlocked(this._n, progress);
  }

  isCompletedIn(progress) {
    if (!progress) return false;
    return progress.completedStepNumbers.includes(this._n);
  }

  // ── Serialization ────────────────────────────────────────────────────────
  toRow(projectId) {
    return {
      project_id: projectId,
      step_n: this._n,
      title: this._title,
      instruction: this._instruction,
      tip: this._tip,
      materials: this._materials.map(m => m.toRow()),
      xp: this._xp,
      video_url: this._videoUrl,
      proof_required: this._proofRequired,
    };
  }

  static fromRow(row) {
    if (!row) return null;
    return new Step({
      n: row.step_n,
      title: row.title,
      instruction: row.instruction,
      tip: row.tip,
      materials: Array.isArray(row.materials) ? row.materials : [],
      xp: row.xp,
      videoUrl: row.video_url,
      proofRequired: row.proof_required !== false,
    });
  }
}
