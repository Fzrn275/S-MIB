import { User } from '../models';

/** ISO date (YYYY-MM-DD) one day before the given ISO date string. */
function previousDay(isoDate) {
  const t = new Date(`${isoDate}T00:00:00Z`).getTime() - 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Pure XP/level/streak update. Given the current user row, an XP delta, the
 * last-active ISO date and today's ISO date, returns the next user row and the
 * next last-active date. Streak: same day = no change; exactly yesterday =
 * +1; any larger gap (or never) = reset to 1. Non-learners pass through.
 */
export function computeReward({ userRow, xpDelta = 0, lastActive = null, today }) {
  const next = User.fromRow(userRow);
  if (!next || typeof next.isLearner !== 'function' || !next.isLearner()) {
    return { userRow, lastActive };
  }
  if (xpDelta > 0) next.addXp(xpDelta);

  let lastActiveNext = lastActive;
  if (lastActive !== today) {
    const skipped = lastActive !== previousDay(today);
    next.bumpStreak(skipped);
    lastActiveNext = today;
  }
  return { userRow: next.toRow(), lastActive: lastActiveNext };
}
