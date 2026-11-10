import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECTS_DATA,
  TECH_CATEGORIES,
  TECH_DATA,
  THREE_SCENE_MODES,
  RECOGNIZED_TECH_ICONS,
  filterProjects,
  getProjectById,
  filterTechStack,
  validateContactForm,
  resolveThemeState,
  getContributionLevel,
  generateContributionCalendar,
  dampScalar,
  computeThreeSceneKinematics,
  getThreeSceneThemePalette
} from './portfolio-logic.js';

test('filterProjects returns all 6 projects when category is all', () => {
  const all = filterProjects(PROJECTS_DATA, 'all');
  assert.equal(all.length, 6);
  assert.deepEqual(
    all.map((p) => p.id),
    [
      'online-exam-platform',
      'ai-resume-builder',
      'chatlet',
      'taskflow',
      'instant-mechanic',
      'interviai'
    ]
  );
});

test('filterProjects filters accurately by category across 6 projects', () => {
  const aiProjects = filterProjects(PROJECTS_DATA, 'ai-platforms');
  assert.equal(aiProjects.length, 3);
  assert.deepEqual(aiProjects.map((p) => p.id), [
    'online-exam-platform',
    'ai-resume-builder',
    'interviai'
  ]);

  const realtimeProjects = filterProjects(PROJECTS_DATA, 'realtime');
  assert.equal(realtimeProjects.length, 2);
  assert.deepEqual(realtimeProjects.map((p) => p.id), ['chatlet', 'instant-mechanic']);

  const mernProjects = filterProjects(PROJECTS_DATA, 'mern');
  assert.equal(mernProjects.length, 1);
  assert.equal(mernProjects[0].id, 'taskflow');
});

test('getProjectById finds project case study details including Instant Mechanic and InterviAI', () => {
  const examPlatform = getProjectById(PROJECTS_DATA, 'online-exam-platform');
  assert.ok(examPlatform);
  assert.equal(examPlatform.index, '01');

  const mechanic = getProjectById(PROJECTS_DATA, 'instant-mechanic');
  assert.ok(mechanic);
  assert.equal(mechanic.index, '05');
  assert.equal(mechanic.githubUrl, null);

  const interviai = getProjectById(PROJECTS_DATA, 'interviai');
  assert.ok(interviai);
  assert.equal(interviai.index, '06');
  assert.equal(interviai.githubUrl, 'https://github.com/mohansaini79/interviai');
  assert.match(interviai.demoCredentials, /student@interviai\.ai/);

  assert.equal(getProjectById(PROJECTS_DATA, 'non-existent'), null);
});

test('filterTechStack filters toolkit items across all 6 resume categories', () => {
  assert.equal(TECH_CATEGORIES.length, 6);
  assert.equal(filterTechStack(TECH_DATA, 'all').length, 32);
  assert.equal(filterTechStack(TECH_DATA, 'frontend').length, 6);
  assert.equal(filterTechStack(TECH_DATA, 'backend').length, 5);
  assert.equal(filterTechStack(TECH_DATA, 'databases').length, 3);
  assert.equal(filterTechStack(TECH_DATA, 'apis-cloud').length, 9);
  assert.equal(filterTechStack(TECH_DATA, 'dev-tools').length, 5);
  assert.equal(filterTechStack(TECH_DATA, 'cs-core').length, 4);
});

test('validateContactForm enforces non-empty fields, email format, and min message length', () => {
  const emptyResult = validateContactForm({ name: '', email: '', subject: '', message: '' });
  assert.equal(emptyResult.valid, false);

  const badEmail = validateContactForm({
    name: 'Alex Rivera',
    email: 'not-an-email',
    subject: 'Hiring Inquiry',
    message: 'We would love to interview you for our Full Stack role.'
  });
  assert.equal(badEmail.valid, false);
  assert.match(badEmail.error, /valid email/i);

  const shortMsg = validateContactForm({
    name: 'Alex Rivera',
    email: 'alex@company.com',
    subject: 'Hiring Inquiry',
    message: 'Too short'
  });
  assert.equal(shortMsg.valid, false);
  assert.match(shortMsg.error, /10 characters/i);

  const valid = validateContactForm({
    name: '  Alex Rivera ',
    email: ' alex@company.com ',
    subject: ' Full Stack Role ',
    message: 'Hello Mohan, we are impressed by your Online Exam Platform and API work!'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.error, null);
  assert.equal(valid.data.email, 'alex@company.com');
});

test('resolveThemeState respects saved preference and defaults to dark mode', () => {
  assert.equal(resolveThemeState('light'), 'light');
  assert.equal(resolveThemeState('dark'), 'dark');
  assert.equal(resolveThemeState(null), 'dark');
  assert.equal(resolveThemeState(undefined), 'dark');
});

test('getContributionLevel maps commit counts to 5 intensity levels (0..4)', () => {
  assert.equal(getContributionLevel(0), 0);
  assert.equal(getContributionLevel(1), 1);
  assert.equal(getContributionLevel(2), 1);
  assert.equal(getContributionLevel(4), 2);
  assert.equal(getContributionLevel(7), 3);
  assert.equal(getContributionLevel(11), 4);
});

test('generateContributionCalendar builds 52 weeks x 7 days (364 days) with distinct period metrics', () => {
  const calLastYear = generateContributionCalendar('last-year');
  assert.equal(calLastYear.weeks.length, 52);
  assert.equal(calLastYear.days.length, 364);
  assert.ok(calLastYear.stats.totalContributions > 500);
  assert.ok(calLastYear.stats.activeDays > 150);
  assert.ok(calLastYear.stats.longestStreak >= 5);

  const cal2025 = generateContributionCalendar('2025');
  assert.equal(cal2025.weeks.length, 52);
  assert.equal(cal2025.days.length, 364);
  assert.notEqual(calLastYear.stats.totalContributions, cal2025.stats.totalContributions);
});

test('dampScalar smoothly interpolates toward target value using exponential decay', () => {
  const step1 = dampScalar(0, 10, 6, 0.016);
  assert.ok(step1 > 0 && step1 < 10);
  const stepLargeDt = dampScalar(0, 10, 8, 5);
  assert.ok(Math.abs(stepLargeDt - 10) < 0.001);
});

test('computeThreeSceneKinematics returns distinct camera, lidAngle, and explode targets across workstation modes and verifies 5 recognizable tech icons', () => {
  assert.ok(THREE_SCENE_MODES.workstation);
  assert.ok(THREE_SCENE_MODES.frontend);
  assert.ok(THREE_SCENE_MODES.backend);
  assert.equal(RECOGNIZED_TECH_ICONS.length, 5);
  assert.deepEqual(
    RECOGNIZED_TECH_ICONS.map((t) => t.name),
    ['Python', 'React', 'JavaScript', 'Node.js', 'MongoDB']
  );

  const wsAtTop = computeThreeSceneKinematics({ mode: 'workstation', scrollProgress: 0, pointerX: 0, pointerY: 0 });
  const feAtMid = computeThreeSceneKinematics({ mode: 'frontend', scrollProgress: 0.5, pointerX: 0.4, pointerY: -0.2 });
  const beAtEnd = computeThreeSceneKinematics({ mode: 'backend', scrollProgress: 1.0, pointerX: -0.5, pointerY: 0.3 });

  assert.equal(wsAtTop.mode, 'workstation');
  assert.equal(feAtMid.mode, 'frontend');
  assert.equal(beAtEnd.mode, 'backend');
  assert.notEqual(wsAtTop.targetExplode, feAtMid.targetExplode);
  assert.notEqual(wsAtTop.targetLidAngle, beAtEnd.targetLidAngle);
  assert.notEqual(wsAtTop.targetCamera.x, feAtMid.targetCamera.x);
});

test('getThreeSceneThemePalette returns calibrated PBR hex colors for dark and light modes', () => {
  const darkPalette = getThreeSceneThemePalette('dark');
  const lightPalette = getThreeSceneThemePalette('light');
  assert.equal(darkPalette.theme, 'dark');
  assert.equal(lightPalette.theme, 'light');
  assert.equal(darkPalette.brandColor, 0xff5500);
  assert.equal(lightPalette.brandColor, 0xd9460f);
  assert.notEqual(darkPalette.fogColor, lightPalette.fogColor);
});


