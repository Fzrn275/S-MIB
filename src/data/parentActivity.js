/**
 * Pure helpers for the parent Activity feed. No I/O — testable in plain Node.
 * Feed rows are plain objects shaped like SEED_PARENT_ACTIVITY.
 */

/** Child filter tabs: 'All' followed by the unique child names, in feed order. */
export function childTabs(feed = []) {
  const seen = [];
  for (const a of feed) {
    if (a.child && !seen.includes(a.child)) seen.push(a.child);
  }
  return ['All', ...seen];
}

/**
 * Filter the feed by the selected child (prefix match, mirroring the prototype's
 * `a.child.startsWith(filter)`) and group into day buckets preserving feed order.
 * Returns `[{ group, items[] }]` with empty groups omitted.
 */
export function filterAndGroup(feed = [], childFilter = 'All') {
  const filtered =
    childFilter && childFilter !== 'All'
      ? feed.filter((a) => (a.child || '').startsWith(childFilter))
      : feed;

  const order = [];
  const byGroup = new Map();
  for (const a of filtered) {
    const g = a.group || 'Earlier';
    if (!byGroup.has(g)) {
      byGroup.set(g, []);
      order.push(g);
    }
    byGroup.get(g).push(a);
  }
  return order.map((g) => ({ group: g, items: byGroup.get(g) }));
}
