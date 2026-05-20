/**
 * Material: a tool or component a learner needs for a Step.
 */
export class Material {
  constructor({ name, quantity = null, url = null, optional = false } = {}) {
    if (!name) throw new Error('Material.name required');
    this._name = String(name).trim();
    this._quantity = quantity;
    this._url = url;
    this._optional = Boolean(optional);
  }

  get name() { return this._name; }
  get quantity() { return this._quantity; }
  get url() { return this._url; }
  get optional() { return this._optional; }

  /** Render this material as a single line, e.g. "Solar panel (6V, 1W) ×2". */
  toString() {
    const q = this._quantity ? ` ×${this._quantity}` : '';
    const opt = this._optional ? ' (optional)' : '';
    return `${this._name}${q}${opt}`;
  }

  toRow() {
    return {
      name: this._name,
      quantity: this._quantity,
      url: this._url,
      optional: this._optional,
    };
  }

  static fromRow(row) {
    if (!row) return null;
    if (typeof row === 'string') return new Material({ name: row });
    return new Material(row);
  }
}
