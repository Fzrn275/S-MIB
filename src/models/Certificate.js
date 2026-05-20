/**
 * Certificate: issued by a GuidedProject upon completion. Has a unique code
 * (used for public verification) and a verify URL.
 */
export class Certificate {
  constructor({
    id = null,
    code,
    projectId,
    userId,
    projectTitle = null,
    userName = null,
    issuedAt = null,
    verifyUrl = null,
  } = {}) {
    if (!projectId) throw new Error('Certificate.projectId required');
    if (!userId) throw new Error('Certificate.userId required');
    this._id = id;
    this._code = code || Certificate.generateCode(projectId, userId);
    this._projectId = projectId;
    this._userId = userId;
    this._projectTitle = projectTitle;
    this._userName = userName;
    this._issuedAt = issuedAt || new Date().toISOString();
    this._verifyUrl = verifyUrl || `https://smib.app/v/${this._code}`;
  }

  get id() { return this._id; }
  get code() { return this._code; }
  get projectId() { return this._projectId; }
  get userId() { return this._userId; }
  get projectTitle() { return this._projectTitle; }
  get userName() { return this._userName; }
  get issuedAt() { return this._issuedAt; }
  get verifyUrl() { return this._verifyUrl; }

  /**
   * A certificate is considered valid as long as it has an issuedAt date
   * that's not in the future. Revocation isn't modeled in MVP.
   */
  isValid() {
    if (!this._issuedAt) return false;
    return new Date(this._issuedAt).getTime() <= Date.now();
  }

  /** Text suitable for native Share. */
  shareText() {
    const title = this._projectTitle || 'Project';
    return `I just completed "${title}" on S-MIB! Verify: ${this._verifyUrl}`;
  }

  toRow() {
    return {
      id: this._id,
      code: this._code,
      project_id: this._projectId,
      user_id: this._userId,
      project_title: this._projectTitle,
      user_name: this._userName,
      issued_at: this._issuedAt,
      verify_url: this._verifyUrl,
    };
  }

  static fromRow(row) {
    if (!row) return null;
    return new Certificate({
      id: row.id,
      code: row.code,
      projectId: row.project_id,
      userId: row.user_id,
      projectTitle: row.project_title,
      userName: row.user_name,
      issuedAt: row.issued_at,
      verifyUrl: row.verify_url,
    });
  }

  /** Build a stable-ish verification code from project + user IDs. */
  static generateCode(projectId, userId) {
    const seed = `${projectId}-${userId}-${Date.now()}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return `CERT-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`;
  }
}
