/**
 * Pure aggregation of a creator's projects for the Analytics screen.
 * `projects` is an array of Project instances.
 */
export function buildAnalytics(projects) {
  const published = projects.filter((p) => p.isPublished);
  const totalStudents = published.reduce((sum, p) => sum + (p.enrolled || 0), 0);
  const avgCompletion = published.length
    ? Math.round(published.reduce((sum, p) => sum + (p.completion || 0), 0) / published.length)
    : 0;

  const rated = published.filter((p) => (p.rating || 0) > 0);
  const avgRating = rated.length
    ? (rated.reduce((sum, p) => sum + p.rating, 0) / rated.length).toFixed(1)
    : null;

  const topProjects = [...published].sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0)).slice(0, 4);

  // Mock weekly trend proportional to total students (real time-series deferred).
  const ratios = [0.12, 0.28, 0.18, 0.42, 0.22, 0.08, 0.52];
  const scale = Math.min(60, totalStudents / 2 + 10);
  const raw = ratios.map((r) => Math.round(r * scale));
  const maxH = Math.max(...raw, 10);
  const weeklyBars = raw.map((h) => Math.max(0.08, h / maxH));

  return { totalStudents, avgCompletion, avgRating, ratedCount: rated.length, topProjects, weeklyBars };
}
