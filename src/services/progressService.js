import { Certificate } from '../models';
import { progressRepo as defaultProgressRepo, certificateRepo as defaultCertificateRepo } from '../repos';

export function makeProgressService({
  progressRepo = defaultProgressRepo,
  certificateRepo = defaultCertificateRepo,
} = {}) {
  /**
   * Complete a step: mutate the Progress, persist it, and (for GuidedProjects
   * that are now fully done) issue a certificate. Returns:
   *   { xpDelta, projectCompleted, certificate, pct }
   * xpDelta is 0 when the step was already completed (no double XP).
   */
  async function completeStep({ user, project, progress, stepN, proofUri = null, rating = 0 }) {
    const step = project.steps.find((s) => s.n === stepN);
    if (!step) throw new Error(`step ${stepN} not found on project ${project.id}`);

    const xpDelta = progress.completeStep(stepN, step.xp, { proofUri });
    if (rating) progress.rateStep(stepN, rating);

    await progressRepo.saveProgress(progress);

    let certificate = null;
    const projectCompleted = project.issuesCertificate() && project.isCompletedBy(progress);
    if (projectCompleted) {
      const cert = new Certificate({
        projectId: project.id,
        userId: user.id,
        projectTitle: project.title,
        userName: user.fullName,
      });
      certificate = await certificateRepo.issueCertificate(cert);
    }

    const pct = typeof project.pctFor === 'function'
      ? project.pctFor(progress)
      : progress.pctOf(project.stepCount);

    return { xpDelta, projectCompleted, certificate, pct };
  }

  return { completeStep };
}

export const progressService = makeProgressService();
