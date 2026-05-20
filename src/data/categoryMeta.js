/** Map a project category to a default emoji + thumb-color class. */
const MAP = {
  Electronics: { emoji: '⚡', color: 'teal-img' },
  Agriculture: { emoji: '🌱', color: 'green-img' },
  Renewable: { emoji: '♻️', color: 'green-img' },
  'Renewable Energy': { emoji: '♻️', color: 'green-img' },
  Coding: { emoji: '🤖', color: 'purple-img' },
  Biology: { emoji: '🔬', color: 'green-img' },
  Physics: { emoji: '📡', color: 'amber-img' },
};

export function categoryMeta(category) {
  return MAP[category] || { emoji: '🛠️', color: 'teal-img' };
}
