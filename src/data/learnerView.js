/**
 * Build a list-card view-model from a Project instance and the learner's
 * Progress (or null). Pure — no I/O. `pct` uses the project's stepCount
 * (which falls back to the row's step_count hint for list views where steps
 * aren't loaded).
 */
export function buildCard(project, progress) {
  const totalSteps = project.stepCount || 0;
  const completedCount = progress ? progress.completedStepNumbers.length : 0;
  const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  return {
    id: project.id,
    project,
    progress: progress || null,
    totalSteps,
    completedCount,
    pct,
    started: pct > 0,
    completed: pct >= 100 && totalSteps > 0,
    bookmarked: progress ? progress.isBookmarked : false,
  };
}
