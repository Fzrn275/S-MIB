import { User } from './User';

/**
 * Parent: a guardian who can link to one or more Learner accounts via the
 * learner's LRN ID and view (read-only) their progress and activity.
 */
export class Parent extends User {
  constructor({
    prnId = null,
    linkedChildIds = [],
    phone = null,
    icNumber = null,
    ...userProps
  } = {}) {
    super({ ...userProps, role: 'parent' });
    this._prnId = prnId;
    this._linkedChildIds = Array.isArray(linkedChildIds) ? [...linkedChildIds] : [];
    this._phone = phone;
    this._icNumber = icNumber;
  }

  get rolePrefix() { return 'PRN'; }
  get roleLabel() { return 'Parent / Guardian'; }

  get prnId() { return this._prnId || this.publicId; }
  get phone() { return this._phone; }
  get icNumber() { return this._icNumber; }

  /** Defensive copy so callers can't mutate internal state. */
  get linkedChildIds() { return [...this._linkedChildIds]; }

  hasLinkedChildren() { return this._linkedChildIds.length > 0; }
  isLinkedTo(childId) { return this._linkedChildIds.includes(childId); }

  linkChild(childId) {
    if (!childId) throw new Error('childId required');
    if (this._linkedChildIds.includes(childId)) return false;
    this._linkedChildIds.push(childId);
    return true;
  }

  unlinkChild(childId) {
    const idx = this._linkedChildIds.indexOf(childId);
    if (idx === -1) return false;
    this._linkedChildIds.splice(idx, 1);
    return true;
  }

  toRow() {
    return {
      ...super.toRow(),
      public_id: this._prnId,
      linked_child_ids: this._linkedChildIds,
      phone: this._phone,
      ic_number: this._icNumber,
    };
  }
}
