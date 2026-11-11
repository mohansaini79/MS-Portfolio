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
  searchPortfolioItems,
  validateContactForm,
  createBrevoSmtpConfig,
  buildBrevoMailOptions,
  getIntroAnimationConfig,
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

test('searchPortfolioItems matches projects and technical skills by keyword', () => {
  const allRes = searchPortfolioItems('', PROJECTS_DATA, TECH_DATA);
  assert.equal(allRes.matchedProjects.length, 6);
  assert.equal(allRes.matchedSkills.length, 32);

  const fastApiRes = searchPortfolioItems('FastAPI', PROJECTS_DATA, TECH_DATA);
  assert.equal(fastApiRes.matchedProjects.length, 1);
  assert.equal(fastApiRes.matchedProjects[0].id, 'instant-mechanic');
  assert.ok(fastApiRes.matchedSkills.some((s) => s.name === 'FastAPI'));

  const mongoRes = searchPortfolioItems('MongoDB', PROJECTS_DATA, TECH_DATA);
  assert.equal(mongoRes.matchedProjects.length, 5);
  assert.ok(mongoRes.matchedSkills.some((s) => s.name === 'MongoDB'));
});

test('validateContactForm, createBrevoSmtpConfig, and buildBrevoMailOptions enforce validation, spam protection, and Brevo SMTP formatting', () => {
  const emptyResult = validateContactForm({ name: '', email: '', subject: '', message: '' });
  assert.equal(emptyResult.valid, false);

  const spamResult = validateContactForm({
    name: 'Bot',
    email: 'bot@spam.com',
    subject: 'Spam',
    message: 'Spam message content here',
    website: 'http://spam.com'
  });
  assert.equal(spamResult.valid, false);
  assert.equal(spamResult.isSpam, true);

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

  const validForm = validateContactForm({
    name: '  Alex Rivera ',
    email: ' alex@company.com ',
    subject: ' Full Stack Role ',
    message: 'Hello Mohan, we are impressed by your Online Exam Platform and API work!'
  });
  assert.equal(validForm.valid, true);

  const smtpConfig = createBrevoSmtpConfig({
    EMAIL_USER: 'mohansaini798330@gmail.com',
    BREVO_PASS: 'xkeysib-test-brevo-pass-placeholder'
  });
  assert.equal(smtpConfig.isConfigured, true);
  assert.equal(smtpConfig.isRestApiKey, true);
  assert.equal(smtpConfig.transportOptions.host, 'smtp-relay.brevo.com');
  assert.equal(smtpConfig.transportOptions.port, 587);
  assert.equal(smtpConfig.transportOptions.secure, false);
  assert.equal(smtpConfig.transportOptions.auth.user, 'mohansaini798330@gmail.com');
  assert.equal(smtpConfig.transportOptions.auth.pass, 'xkeysib-test-brevo-pass-placeholder');

  const mailOptions = buildBrevoMailOptions(validForm.data, smtpConfig);
  assert.match(mailOptions.from, /mohansaini798330@gmail\.com/);
  assert.equal(mailOptions.to, 'mohansaini798330@gmail.com');
  assert.match(mailOptions.replyTo, /alex@company\.com/);
  assert.match(mailOptions.subject, /Full Stack Role/);
});

test('getIntroAnimationConfig returns Hello intro parameters and respects prefers-reduced-motion', () => {
  const normalIntro = getIntroAnimationConfig({ prefersReducedMotion: false });
  assert.equal(normalIntro.shouldAnimate, true);
  assert.equal(normalIntro.primaryWord, 'Hello');
  assert.equal(normalIntro.totalDurationMs, 4800);
  assert.equal(normalIntro.exitDurationMs, 1200);

  const reducedIntro = getIntroAnimationConfig({ prefersReducedMotion: true });
  assert.equal(reducedIntro.shouldAnimate, false);
  assert.equal(reducedIntro.totalDurationMs, 0);
  assert.equal(reducedIntro.exitDurationMs, 0);
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

test('Nodemailer transport builds valid MIME email with Reply-To and Brevo SMTP settings', async () => {
  const nodemailer = (await import('nodemailer')).default;
  const smtpConfig = createBrevoSmtpConfig({
    EMAIL_USER: 'mohansaini798330@gmail.com',
    BREVO_PASS: 'test-brevo-pass'
  });

  // Verify Nodemailer accepts the Brevo SMTP transport options
  const smtpTransporter = nodemailer.createTransport(smtpConfig.transportOptions);
  assert.equal(smtpTransporter.options.host, 'smtp-relay.brevo.com');
  assert.equal(smtpTransporter.options.port, 587);
  assert.equal(smtpTransporter.options.secure, false);

  // Verify Nodemailer stream transport builds the full RFC822 message with Reply-To
  const streamTransporter = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const mailOptions = buildBrevoMailOptions(
    {
      name: 'Recruiter Lead',
      email: 'recruiter@company.io',
      subject: 'Senior Full Stack Developer Opportunity',
      message: 'We would love to schedule a technical interview with you this week.'
    },
    smtpConfig
  );

  const info = await streamTransporter.sendMail(mailOptions);
  const rawMime = info.message.toString('utf8');
  assert.match(rawMime, /From: Mohan Saini Portfolio <mohansaini798330@gmail\.com>/);
  assert.match(rawMime, /To: mohansaini798330@gmail\.com/);
  assert.match(rawMime, /Reply-To: Recruiter Lead <recruiter@company\.io>/);
  assert.match(rawMime, /Senior Full Stack Developer Opportunity/);
});
