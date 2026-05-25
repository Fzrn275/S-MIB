/**
 * Runtime self-test of the entire OOP model layer.
 * Returns { ok: boolean, results: Array<{name, ok, error?}> }.
 *
 * Called once on app boot from the smoke screen so any inheritance/method
 * regression surfaces immediately instead of hiding until a screen tries to
 * use it.
 */
import {
  User,
  Student,
  JuniorLearner,
  SeniorLearner,
  Creator,
  VerifiedCreator,
  ContentMentor,
  Parent,
  Project,
  GuidedProject,
  OpenProject,
  Step,
  Material,
  Progress,
  Achievement,
  Certificate,
} from './index';

function check(name, fn, results) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (err) {
    results.push({ name, ok: false, error: err.message || String(err) });
  }
}

export function runModelSmokeTest() {
  const r = [];

  check('User: subclass instanceof chain', () => {
    const j = new JuniorLearner({ id: 'u1', email: 'a@b.c', displayName: 'Alice', grade: 'Form 2' });
    if (!(j instanceof JuniorLearner)) throw new Error('not JuniorLearner');
    if (!(j instanceof Student)) throw new Error('not Student');
    if (!(j instanceof User)) throw new Error('not User');
    if (j.rolePrefix !== 'LRN') throw new Error(`rolePrefix=${j.rolePrefix}`);
    if (j.roleLabel !== 'Lower Secondary') throw new Error(`roleLabel=${j.roleLabel}`);
  }, r);

  check('SeniorLearner: Upper Secondary label, level + rank defaults', () => {
    const s = new SeniorLearner({ id: 'u2', email: 'b@c.d', displayName: 'Bob', xp: 250 });
    if (s.roleLabel !== 'Upper Secondary') throw new Error(`roleLabel=${s.roleLabel}`);
    if (s.level !== 1) throw new Error(`level=${s.level}`);
    if (s.rankTitle !== 'Newcomer') throw new Error(`rank=${s.rankTitle}`);
  }, r);

  check('JuniorLearner.difficultyAccess() excludes Hard', () => {
    const j = new JuniorLearner({ id: 'j1', email: 'j@x.y', displayName: 'Jo', grade: 'Form 2' });
    const access = j.difficultyAccess();
    if (access.includes('Hard')) throw new Error('junior should not access Hard');
    if (!access.includes('Easy') || !access.includes('Medium')) throw new Error('junior easy/medium');
  }, r);

  check('SeniorLearner.difficultyAccess() includes Hard', () => {
    const s = new SeniorLearner({ id: 's1', email: 's@x.y', displayName: 'Su', grade: 'Form 5' });
    if (!s.difficultyAccess().includes('Hard')) throw new Error('senior should access Hard');
  }, r);

  check('Student.addXp advances level across threshold', () => {
    const s = new SeniorLearner({ id: 'u3', email: 'c@d.e', displayName: 'Cara', xp: 90 });
    const delta = s.addXp(50);
    if (s.level !== 2) throw new Error(`expected level 2 got ${s.level}`);
    if (delta !== 1) throw new Error(`delta=${delta}`);
    if (s.xp !== 140) throw new Error(`xp=${s.xp}`);
  }, r);

  check('Student.levelProgressPct is bounded 0..100', () => {
    const s = new SeniorLearner({ id: 'u4', email: 'd@e.f', displayName: 'Dan', xp: 150, level: 2 });
    const pct = s.levelProgressPct;
    if (pct < 0 || pct > 100) throw new Error(`pct=${pct}`);
  }, r);

  check('Creator: cannot publish directly', () => {
    const c = new Creator({ id: 'c1', email: 'cr@e.f', displayName: 'Cyn' });
    if (c.canPublishDirectly()) throw new Error('base creator should not publish');
    if (c.intendedPublishStatus() !== 'review') throw new Error('should be review');
  }, r);

  check('VerifiedCreator: can publish directly', () => {
    const v = new VerifiedCreator({ id: 'c2', email: 'vc@e.f', displayName: 'Vic' });
    if (!v.canPublishDirectly()) throw new Error('verified should publish');
    if (v.intendedPublishStatus() !== 'published') throw new Error('should be published');
  }, r);

  check('ContentMentor: can review submissions, ContentMentor extends VerifiedCreator', () => {
    const m = new ContentMentor({ id: 'c3', email: 'mt@e.f', displayName: 'Mei' });
    if (!(m instanceof VerifiedCreator)) throw new Error('mentor is not VerifiedCreator');
    if (!m.canReviewSubmission()) throw new Error('mentor can review');
    if (m.rolePrefix !== 'MEN') throw new Error(`rolePrefix=${m.rolePrefix}`);
  }, r);

  check('Parent: link/unlink children', () => {
    const p = new Parent({ id: 'p1', email: 'pa@e.f', displayName: 'Pat' });
    if (p.hasLinkedChildren()) throw new Error('starts empty');
    p.linkChild('lrn-1');
    p.linkChild('lrn-2');
    if (!p.isLinkedTo('lrn-1')) throw new Error('link broken');
    if (p.linkedChildIds.length !== 2) throw new Error('count');
    p.unlinkChild('lrn-1');
    if (p.linkedChildIds.length !== 1) throw new Error('unlink count');
  }, r);

  check('User.fromRow dispatches to correct subclass', () => {
    const row = {
      id: 'x', email: 'x@y.z', display_name: 'X', role: 'junior_learner',
      created_at: '2025-01-01', grade: 'Form 1', xp: 0, level: 1, streak: 0,
    };
    const u = User.fromRow(row);
    if (!(u instanceof JuniorLearner)) throw new Error('expected junior');
  }, r);

  check('Step: requires positive n, materials hydrate from strings', () => {
    const s = new Step({ n: 1, title: 'Wire', materials: ['Wire', 'Tape'], xp: 20 });
    if (s.materials.length !== 2) throw new Error('materials count');
    if (!(s.materials[0] instanceof Material)) throw new Error('material class');
  }, r);

  check('Step: rejects invalid n', () => {
    let threw = false;
    try { new Step({ n: 0, title: 't' }); } catch { threw = true; }
    if (!threw) throw new Error('should have thrown');
  }, r);

  check('Material.toString includes quantity', () => {
    const m = new Material({ name: 'Wire', quantity: 4 });
    if (m.toString() !== 'Wire ×4') throw new Error(m.toString());
  }, r);

  check('GuidedProject: step unlock obeys order', () => {
    const p = new GuidedProject({
      id: 'p1', title: 'Demo', status: 'published',
      steps: [
        { title: 'a', xp: 10 },
        { title: 'b', xp: 20 },
        { title: 'c', xp: 30 },
      ],
    });
    if (p.stepCount !== 3) throw new Error('stepCount');
    if (p.totalXp !== 60) throw new Error('totalXp');
    const prog = new Progress({ userId: 'u', projectId: 'p1' });
    if (p.isStepUnlocked(2, prog)) throw new Error('step 2 should be locked');
    prog.completeStep(1, 10);
    if (!p.isStepUnlocked(2, prog)) throw new Error('step 2 should now unlock');
    if (p.isStepUnlocked(3, prog)) throw new Error('step 3 still locked');
  }, r);

  check('OpenProject: all steps unlocked, no certificate', () => {
    const p = new OpenProject({
      id: 'p2', title: 'Open', status: 'published',
      steps: [{ title: 'a' }, { title: 'b' }],
    });
    if (!p.isStepUnlocked(2)) throw new Error('open should always unlock');
    if (p.issuesCertificate()) throw new Error('open issues none');
  }, r);

  check('Project.canBeStartedBy: rejects unpublished, accepts learner on published', () => {
    const draft = new GuidedProject({ id: 'd', title: 't', status: 'draft' });
    const pub = new GuidedProject({ id: 'p', title: 't', status: 'published' });
    const learner = new SeniorLearner({ id: 'u', email: 'x@y.z', displayName: 'L' });
    if (draft.canBeStartedBy(learner)) throw new Error('draft should be unstartable');
    if (!pub.canBeStartedBy(learner)) throw new Error('pub should be startable');
  }, r);

  check('Progress.completeStep idempotent + xp accumulates', () => {
    const prog = new Progress({ userId: 'u', projectId: 'p' });
    const delta1 = prog.completeStep(1, 50);
    const delta2 = prog.completeStep(1, 50);
    if (delta1 !== 50) throw new Error(`delta1=${delta1}`);
    if (delta2 !== 0) throw new Error(`delta2=${delta2}`);
    if (prog.xpEarned !== 50) throw new Error(`xp=${prog.xpEarned}`);
  }, r);

  check('Progress.rateStep validates 1..5', () => {
    const prog = new Progress({ userId: 'u', projectId: 'p' });
    let threw = false;
    try { prog.rateStep(1, 6); } catch { threw = true; }
    if (!threw) throw new Error('should reject 6');
    prog.rateStep(1, 5);
    if (prog.stepRatings[1] !== 5) throw new Error('rating not stored');
  }, r);

  check('Achievement.earn is idempotent', () => {
    const a = new Achievement({ name: 'First Build', tier: 'bronze', icon: '⚡' });
    if (a.isEarned) throw new Error('starts unearned');
    const first = a.earn();
    const second = a.earn();
    if (!first) throw new Error('first should return true');
    if (second) throw new Error('second should return false');
    if (!a.isEarned) throw new Error('should be earned now');
  }, r);

  check('Certificate.shareText and generateCode', () => {
    const c = new Certificate({ projectId: 'p1', userId: 'u1', projectTitle: 'Solar' });
    if (!c.code.startsWith('CERT-')) throw new Error(`code=${c.code}`);
    if (!c.shareText().includes('Solar')) throw new Error('shareText');
    if (!c.isValid()) throw new Error('should be valid');
  }, r);

  check('ContentMentor.reviewSubmission updates project status', () => {
    const mentor = new ContentMentor({ id: 'm1', email: 'm@x.y', displayName: 'M' });
    const proj = new GuidedProject({ id: 'p', title: 'T', status: 'review' });
    const next = mentor.reviewSubmission(proj, 'approve', 'looks good');
    if (next !== 'published') throw new Error(`next=${next}`);
    if (proj.status !== 'published') throw new Error('project not updated');
  }, r);

  check('GuidedProject.pctFor matches completion', () => {
    const proj = new GuidedProject({
      id: 'p', title: 'T', status: 'published',
      steps: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }],
    });
    const prog = new Progress({ userId: 'u', projectId: 'p' });
    prog.completeStep(1); prog.completeStep(2);
    if (proj.pctFor(prog) !== 50) throw new Error(`pct=${proj.pctFor(prog)}`);
  }, r);

  check('Project.stepCount falls back to stepCountHint when steps not loaded', () => {
    const p = new GuidedProject({ id: 9, title: 'T', status: 'published', stepCountHint: 7 });
    if (p.stepCount !== 7) throw new Error(`stepCount=${p.stepCount}`);
    const loaded = new GuidedProject({ id: 9, title: 'T', steps: [{ title: 'a' }, { title: 'b' }], stepCountHint: 7 });
    if (loaded.stepCount !== 2) throw new Error(`loaded stepCount=${loaded.stepCount}`);
  }, r);

  const ok = r.every(x => x.ok);
  return { ok, results: r };
}
