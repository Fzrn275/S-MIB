/**
 * Achievement: a badge a user can earn. Has a tier (bronze/silver/gold/
 * legendary), an icon (emoji), a name, a description, and an earnedAt
 * timestamp once unlocked.
 */
export class Achievement {
  static TIERS = ['bronze', 'silver', 'gold', 'legendary'];

  constructor({
    id = null,
    tier = 'bronze',
    icon = '🏅',
    name,
    description = '',
    earnedAt = null,
    code = null,
  } = {}) {
    if (!name) throw new Error('Achievement.name required');
    if (!Achievement.TIERS.includes(tier)) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    this._id = id;
    this._tier = tier;
    this._icon = icon;
    this._name = name;
    this._description = description;
    this._earnedAt = earnedAt;
    this._code = code;
  }

  get id() { return this._id; }
  get tier() { return this._tier; }
  get icon() { return this._icon; }
  get name() { return this._name; }
  get description() { return this._description; }
  get earnedAt() { return this._earnedAt; }
  get code() { return this._code; }

  get isEarned() { return this._earnedAt !== null && this._earnedAt !== undefined; }
  get isLegendary() { return this._tier === 'legendary'; }

  /** Mark this achievement as earned. Idempotent. */
  earn() {
    if (this._earnedAt) return false;
    this._earnedAt = new Date().toISOString();
    return true;
  }

  /** Numeric weight used for sorting/ranking. */
  get tierWeight() {
    return Achievement.TIERS.indexOf(this._tier);
  }

  toRow() {
    return {
      id: this._id,
      tier: this._tier,
      icon: this._icon,
      name: this._name,
      description: this._description,
      earned_at: this._earnedAt,
      code: this._code,
    };
  }

  static fromRow(row) {
    if (!row) return null;
    return new Achievement({
      id: row.id,
      tier: row.tier,
      icon: row.icon,
      name: row.name,
      description: row.description,
      earnedAt: row.earned_at,
      code: row.code,
    });
  }
}
