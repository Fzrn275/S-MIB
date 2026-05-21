/**
 * Pure aggregation over a parent's linked children. No I/O — trivially testable.
 * Children are plain view objects shaped like SEED_CHILDREN (see Day 5 spec).
 */

/** Sum the across-children totals shown on the parent dashboard/profile. */
export function aggregate(children = []) {
  return children.reduce(
    (acc, c) => ({
      totalActive: acc.totalActive + (c.active_proj || 0),
      totalDone: acc.totalDone + (c.done_proj || 0),
      totalBadges: acc.totalBadges + (c.badges || 0),
    }),
    { totalActive: 0, totalDone: 0, totalBadges: 0 }
  );
}

/** XP progress percent toward the next level, clamped 0–100. */
export function xpPercent(child) {
  if (!child || !child.xpMax) return 0;
  return Math.max(0, Math.min(100, Math.round((child.xp / child.xpMax) * 100)));
}
