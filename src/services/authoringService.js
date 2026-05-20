import { creatorRepo as defaultCreatorRepo } from '../repos';
import { categoryMeta } from '../data/categoryMeta';

function parseMaterials(input) {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'string') return [];
  return input.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
}

export function makeAuthoringService({ creatorRepo = defaultCreatorRepo } = {}) {
  /**
   * Persist a project + its steps and apply the status lifecycle.
   * `project` is plain data (id optional). `submit` requests review/publish.
   */
  async function saveProject({ user, project, steps, submit = false }) {
    const meta = categoryMeta(project.category);
    const wasPublished = project.status === 'published';

    let status;
    if (submit) status = user.intendedPublishStatus();
    else if (wasPublished) status = user.intendedPublishStatus(); // re-review on edit
    else status = project.status === 'review' ? 'review' : 'draft';

    const projectRow = {
      id: project.id ?? null,
      title: project.title,
      category: project.category,
      difficulty: project.difficulty || 'Easy',
      duration: project.duration || null,
      description: project.description || null,
      emoji: project.emoji || meta.emoji,
      color: project.color || meta.color,
      creator_id: user.id,
      creator_name: user.fullName,
      status,
      enrolled: project.enrolled || 0,
      completion: project.completion || 0,
      rating: project.rating || 0,
      cover_url: project.cover_url || null,
      type: project.type || 'guided',
    };

    const stepRows = (steps || []).map((s) => ({
      title: s.title,
      instruction: s.instruction || '',
      tip: s.tip || null,
      materials: parseMaterials(s.materials),
      xp: Number(s.xp) || 40,
      video_url: s.videoUrl || s.video_url || null,
      proof_required: s.proofRequired !== false,
    }));

    return creatorRepo.saveProject({ projectRow, stepRows });
  }

  async function submitForReview({ user, projectId }) {
    return creatorRepo.setStatus(projectId, user.intendedPublishStatus(), user.id);
  }

  async function withdraw({ user, projectId }) {
    return creatorRepo.setStatus(projectId, 'draft', user.id);
  }

  return { saveProject, submitForReview, withdraw };
}

export const authoringService = makeAuthoringService();
