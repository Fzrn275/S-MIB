import { initials as initialsOf } from '../theme/tokens';

/**
 * Base class for every authenticated entity in S-MIB.
 *
 * Inheritance tree:
 *   User
 *     ├── Student
 *     │     ├── JuniorLearner
 *     │     └── SeniorLearner
 *     ├── Creator
 *     │     ├── VerifiedCreator
 *     │     └── ContentMentor
 *     └── Parent
 *
 * Subclasses MUST override `rolePrefix` and SHOULD override `roleLabel`.
 */
export class User {
  constructor({
    id,
    email,
    displayName,
    avatarUrl = null,
    role = 'user',
    createdAt = new Date().toISOString(),
    locale = 'en',
    publicId = null,
  } = {}) {
    if (new.target === User) {
      // Allow building a raw User (e.g. before role resolution), but warn.
    }
    this._id = id;
    this._email = email;
    this._displayName = displayName;
    this._avatarUrl = avatarUrl;
    this._role = role;
    this._createdAt = createdAt;
    this._locale = locale;
    this._publicId = publicId;
  }

  // ── Getters (encapsulation) ──────────────────────────────────────────────
  get id() { return this._id; }
  get email() { return this._email; }
  get displayName() { return this._displayName; }
  get avatarUrl() { return this._avatarUrl; }
  get role() { return this._role; }
  get createdAt() { return this._createdAt; }
  get locale() { return this._locale; }

  get initials() { return initialsOf(this._displayName); }
  get fullName() { return this._displayName; }

  /** Two-letter role prefix used in the public ID. Override per role. */
  get rolePrefix() { return 'USR'; }

  /** Human-readable role label. Override per role. */
  get roleLabel() { return 'User'; }

  /**
   * Public ID shown in the app (e.g. LRN-0042). Prefers the stored/registered
   * id (from the DB or registration); falls back to a prefix + id slice for
   * demo users that were created without one.
   */
  get publicId() {
    if (this._publicId) return this._publicId;
    const raw = String(this._id || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const tail = raw.slice(-4).padStart(4, '0');
    return `${this.rolePrefix}-${tail}`;
  }

  // ── Mutators (controlled) ────────────────────────────────────────────────
  setDisplayName(name) {
    if (!name || typeof name !== 'string') throw new Error('displayName required');
    this._displayName = name.trim();
  }

  setAvatarUrl(url) { this._avatarUrl = url || null; }
  setLocale(locale) { this._locale = locale || 'en'; }

  // ── Role-check helpers ───────────────────────────────────────────────────
  isLearner() { return this._role === 'junior_learner' || this._role === 'senior_learner'; }
  isCreator() { return this._role === 'creator' || this._role === 'verified_creator' || this._role === 'content_mentor'; }
  isParent()  { return this._role === 'parent'; }

  // ── Serialization (Supabase row ⇄ instance) ──────────────────────────────
  toRow() {
    return {
      id: this._id,
      email: this._email,
      display_name: this._displayName,
      avatar_url: this._avatarUrl,
      role: this._role,
      created_at: this._createdAt,
      locale: this._locale,
    };
  }

  /**
   * Build the right subclass instance given a row from the `profiles` table.
   * This is the single entry point — repos call this rather than `new User(...)`.
   */
  static fromRow(row) {
    if (!row) return null;
    // Lazy-require to avoid circular imports at module load time.
    const { JuniorLearner } = require('./JuniorLearner');
    const { SeniorLearner } = require('./SeniorLearner');
    const { Creator } = require('./Creator');
    const { VerifiedCreator } = require('./VerifiedCreator');
    const { ContentMentor } = require('./ContentMentor');
    const { Parent } = require('./Parent');

    const base = {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      createdAt: row.created_at,
      locale: row.locale || 'en',
      publicId: row.public_id,
    };

    switch (row.role) {
      case 'junior_learner':
        return new JuniorLearner({ ...base, ...studentFields(row) });
      case 'senior_learner':
        return new SeniorLearner({ ...base, ...studentFields(row) });
      case 'creator':
        return new Creator({ ...base, ...creatorFields(row) });
      case 'verified_creator':
        return new VerifiedCreator({ ...base, ...creatorFields(row) });
      case 'content_mentor':
        return new ContentMentor({ ...base, ...creatorFields(row) });
      case 'parent':
        return new Parent({ ...base, prnId: row.public_id, linkedChildIds: row.linked_child_ids || [], phone: row.phone, icNumber: row.ic_number });
      default:
        return new User(base);
    }
  }
}

function studentFields(row) {
  return {
    lrnId: row.public_id,
    schoolName: row.school_name,
    grade: row.grade,
    xp: row.xp || 0,
    level: row.level || 1,
    streak: row.streak || 0,
  };
}

function creatorFields(row) {
  return {
    crtId: row.public_id,
    organization: row.organization,
    bio: row.bio,
    expertise: row.expertise,
    rating: row.rating || 0,
  };
}
