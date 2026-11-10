// ═══════════════════════════════════════════════════════════════════
// portfolio-logic.js — Pure business logic for Mohan Saini Portfolio
// Shared between browser UI (script.js) and Node unit tests
// ═══════════════════════════════════════════════════════════════════

export const PROJECTS_DATA = [
  {
    id: 'online-exam-platform',
    index: '01',
    title: 'Online Exam Platform — Shobhit University',
    shortTitle: 'Online Exam Platform',
    category: 'ai-platforms',
    categoryLabel: 'AI-Powered Platform',
    period: 'Mar 2026 – Present',
    status: 'Production · Live',
    metrics: '270+ Students · 80% Faster Grading',
    featured: true,
    url: 'https://sugexam.live',
    summary:
      'AI-driven online examination platform adopted by 270+ students at Shobhit University, featuring automated grading and real-time result analytics that reduced manual evaluation turnaround by 80%.',
    architecture:
      'Built with Python Flask and MongoDB, secured with stateless JWT authentication, and styled with Tailwind CSS and JavaScript to deliver automated grading workflows and real-time cohort analytics.',
    highlights: [
      'AI-driven online examination platform.',
      'Adopted by 270+ students.',
      'Automated grading and real-time result analytics.',
      'Reduced manual evaluation turnaround by 80%.'
    ],
    stack: ['Flask', 'MongoDB', 'JWT', 'Tailwind CSS', 'JavaScript']
  },
  {
    id: 'ai-resume-builder',
    index: '02',
    title: 'AI-Based Resume Builder',
    shortTitle: 'AI-Based Resume Builder',
    category: 'ai-platforms',
    categoryLabel: 'AI-Powered Platform',
    period: 'Apr 2026 – Present',
    status: 'Production · Live',
    metrics: '30+ Active Users · 95% Parsing Accuracy',
    featured: true,
    url: 'https://www.smartcv.dev',
    summary:
      'AI-powered resume creation platform with ATS scoring and PDF export, reaching 30+ active users within the first month and achieving 95% parsing accuracy.',
    architecture:
      'Integrates Google OAuth 2.0 authentication, MongoDB document persistence, and GroqAI API inference with a responsive HTML, Tailwind CSS, and JavaScript frontend for real-time ATS scoring and PDF export.',
    highlights: [
      'AI-powered resume creation platform.',
      'ATS scoring and PDF export.',
      '30+ active users within the first month.',
      '95% parsing accuracy.'
    ],
    stack: ['HTML', 'Tailwind CSS', 'JavaScript', 'MongoDB', 'GroqAI API', 'Google OAuth']
  },
  {
    id: 'chatlet',
    index: '03',
    title: 'Chatlet — Real-Time Chat Application',
    shortTitle: 'Chatlet',
    category: 'realtime',
    categoryLabel: 'Real-Time Application',
    period: 'Jul 2025 – Dec 2025',
    status: 'Production · Live',
    metrics: 'Sub-100ms Message Delivery',
    featured: true,
    url: 'https://my-chatlet-app-1.onrender.com/chat',
    summary:
      'Real-time messaging application featuring Google OAuth authentication, Cloudinary media storage, and sub-100ms bidirectional message delivery.',
    architecture:
      'Event-driven Flask and Socket.IO WebSocket backend paired with MongoDB persistence, Google OAuth authentication, and Cloudinary media storage.',
    highlights: [
      'Real-time messaging application.',
      'Google OAuth authentication.',
      'Cloudinary media storage.',
      'Sub-100ms message delivery.'
    ],
    stack: ['Flask', 'Socket.IO', 'MongoDB', 'HTML', 'CSS', 'JavaScript']
  },
  {
    id: 'taskflow',
    index: '04',
    title: 'TaskFlow — Smart Task & Time Management',
    shortTitle: 'TaskFlow',
    category: 'mern',
    categoryLabel: 'MERN Stack Application',
    period: 'Jan 2026 – Present',
    status: 'Production · Live',
    metrics: '+40% Task Completion Rate',
    featured: true,
    url: 'https://task-flow-app-sepia.vercel.app/dashboard',
    summary:
      'MERN-stack productivity application with JWT authentication and complete CRUD functionality that improved personal task completion rates by 40%.',
    architecture:
      'Full-stack MongoDB, Express.js, React.js, and Node.js architecture secured with JWT authentication and styled with Tailwind CSS for real-time task and time tracking.',
    highlights: [
      'MERN-stack productivity application.',
      'JWT authentication.',
      'Complete CRUD functionality.',
      'Improved personal task completion rates by 40%.'
    ],
    stack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JWT', 'Tailwind CSS']
  },
  {
    id: 'instant-mechanic',
    index: '05',
    title: 'Instant Mechanic — Live Operations Dashboard',
    shortTitle: 'Instant Mechanic',
    category: 'realtime',
    categoryLabel: 'Full-Stack Operations Dashboard',
    period: '2026',
    status: 'Production · Live',
    metrics: '520+ Demo Seed Records · Real-Time WebSockets',
    featured: true,
    url: 'https://vehicle-service-dashboard-rho.vercel.app/',
    githubUrl: null,
    summary:
      'A full-stack vehicle service operations dashboard designed to monitor bookings, mechanics, customers, and revenue through interactive analytics.',
    architecture:
      'Backend Architecture: FastAPI + MongoDB Atlas (async Motor driver) with real-time WebSocket event streaming, paired with a Next.js 16, TypeScript, Tailwind CSS v4, and Recharts dashboard deployed across AWS EC2 and Vercel.',
    highlights: [
      'Real-time booking monitoring using WebSockets.',
      'Booking management, search, filters and pagination.',
      'Mechanics and customer management.',
      'Revenue analytics and interactive charts.',
      'Dark/Light mode and responsive dashboard.',
      '520+ demo seed records.'
    ],
    stack: [
      'Next.js 16',
      'TypeScript',
      'Tailwind CSS v4',
      'Python FastAPI',
      'MongoDB Atlas',
      'Motor',
      'WebSockets',
      'Recharts',
      'AWS EC2',
      'Vercel'
    ]
  },
  {
    id: 'interviai',
    index: '06',
    title: 'InterviAI — AI Resume-to-Interview Agent',
    shortTitle: 'InterviAI',
    category: 'ai-platforms',
    categoryLabel: 'Frontend-Only Demo · Simulated AI',
    period: '2026',
    status: 'Frontend-Only Demo (Simulated AI)',
    metrics: 'Mock Interviews · Chart.js Analytics',
    featured: true,
    url: 'https://intervi-ai-lt.vercel.app/auth/login.html',
    githubUrl: 'https://github.com/mohansaini79/interviai',
    demoCredentials: 'Email: student@interviai.ai | Password: 123456',
    summary:
      'A frontend-only AI Resume-to-Interview platform that helps students prepare for job interviews through resume analysis simulations, mock interviews, practice sessions, and performance reports.',
    architecture:
      'Frontend-Only Architecture (Simulated AI): Built with HTML5, CSS3, Bootstrap 5, and Vanilla JavaScript (ES6+), utilizing browser localStorage for session/history persistence, WebRTC media device checks, and Chart.js for performance analytics without external backend or live LLM API calls.',
    highlights: [
      'Resume upload and simulated AI resume analysis.',
      'Interview configuration with difficulty and duration settings.',
      'Camera and microphone device checks.',
      'Interactive mock interview simulation.',
      'Performance reports with charts.',
      'Practice mode and interview history.',
      'Profile management and responsive dark UI.'
    ],
    stack: [
      'HTML5',
      'CSS3',
      'Bootstrap 5',
      'Vanilla JavaScript ES6+',
      'Bootstrap Icons',
      'Chart.js',
      'localStorage'
    ]
  }
];

export const TECH_CATEGORIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    skills: ['JavaScript (ES6+)', 'React.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS']
  },
  {
    id: 'backend',
    label: 'Backend',
    skills: ['Node.js', 'Express.js', 'Flask', 'FastAPI', 'Django']
  },
  {
    id: 'databases',
    label: 'Databases',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL']
  },
  {
    id: 'apis-cloud',
    label: 'APIs & Cloud',
    skills: ['REST APIs', 'JWT', 'OAuth 2.0', 'Socket.IO', 'OpenAPI', 'Vercel', 'Netlify', 'Render', 'Railway']
  },
  {
    id: 'dev-tools',
    label: 'Developer Tools',
    skills: ['Git', 'GitHub', 'Docker', 'Postman', 'GitHub Actions']
  },
  {
    id: 'cs-core',
    label: 'Computer Science',
    skills: ['DSA', 'OOP', 'System Design', 'Responsive UI']
  }
];

export const TECH_DATA = TECH_CATEGORIES.flatMap((group) =>
  group.skills.map((skill) => ({
    name: skill,
    category: group.id,
    categoryLabel: group.label
  }))
);

/**
 * Filter projects by category key ('all', 'ai-platforms', 'realtime', 'mern')
 */
export function filterProjects(projects, category = 'all') {
  if (!Array.isArray(projects)) return [];
  const normalized = String(category || 'all').trim().toLowerCase();
  if (normalized === 'all') return projects;
  return projects.filter((p) => p.category === normalized);
}

/**
 * Find a single project by its id
 */
export function getProjectById(projects, id) {
  if (!Array.isArray(projects) || !id) return null;
  return projects.find((p) => p.id === id) || null;
}

/**
 * Filter tech stack items by category ('all', 'frontend', 'backend', 'databases', 'apis-cloud', 'dev-tools', 'cs-core')
 */
export function filterTechStack(techList, category = 'all') {
  if (!Array.isArray(techList)) return [];
  const normalized = String(category || 'all').trim().toLowerCase();
  if (normalized === 'all') return techList;
  return techList.filter((item) => item.category === normalized);
}

/**
 * Validate contact form payload before submission
 */
export function validateContactForm({ name, email, subject, message } = {}) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const cleanSubject = String(subject || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    return { valid: false, error: 'Please complete all required fields (Name, Email, Subject, and Message).' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., alex@company.com).' };
  }

  if (cleanMessage.length < 10) {
    return { valid: false, error: 'Message is too short — please share at least 10 characters about your project or inquiry.' };
  }

  return {
    valid: true,
    error: null,
    data: {
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage
    }
  };
}

/**
 * Resolve theme state ('dark' | 'light') — defaults to signature dark mode unless saved as 'light'
 */
export function resolveThemeState(savedTheme) {
  if (savedTheme === 'light') return 'light';
  return 'dark';
}

/**
 * Quantize daily commit count into 5 discrete intensity levels (0..4), D3 scaleThreshold style
 */
export function getContributionLevel(count) {
  const n = Number(count) || 0;
  if (n <= 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 8) return 3;
  return 4;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FOCUS_MILESTONES = [
  { start: '2025-07-01', end: '2025-09-30', boost: 3, label: 'Chatlet — Flask & Socket.IO Engine' },
  { start: '2025-10-01', end: '2026-01-20', boost: 5, label: 'Zaalima Internship — SyncSpace & TasteTrail' },
  { start: '2026-01-21', end: '2026-02-28', boost: 4, label: 'TaskFlow — MERN Stack CRUD & JWT Auth' },
  { start: '2026-03-01', end: '2026-04-15', boost: 6, label: 'Online Exam Platform — Shobhit University' },
  { start: '2026-04-16', end: '2026-05-10', boost: 5, label: 'AI-Based Resume Builder — GroqAI & OAuth' },
  { start: '2026-05-11', end: '2026-08-31', boost: 6, label: 'Springer Capital — Node.js & Express REST APIs' },
  { start: '2026-09-01', end: '2026-12-31', boost: 4, label: 'Full-Stack Architecture & AI Platform Scaling' }
];

function findMilestone(isoDate) {
  for (const m of FOCUS_MILESTONES) {
    if (isoDate >= m.start && isoDate <= m.end) return m;
  }
  return { boost: 2, label: 'Core Full-Stack & DSA Practice' };
}

/**
 * Generate a 52-week x 7-day (364-day) GitHub activity calendar dataset for 'last-year', '2026', or '2025'
 */
export function generateContributionCalendar(period = 'last-year') {
  const normalizedPeriod = String(period || 'last-year').trim().toLowerCase();

  let endDate;
  if (normalizedPeriod === '2025') {
    endDate = new Date(Date.UTC(2025, 11, 27)); // End of 2025 aligned to Saturday
  } else if (normalizedPeriod === '2026') {
    endDate = new Date(Date.UTC(2026, 10, 7));
  } else {
    endDate = new Date(Date.UTC(2026, 10, 7));
  }

  const totalWeeks = 52;
  const totalDays = totalWeeks * 7; // 364 days
  const startDate = new Date(endDate.getTime() - (totalDays - 1) * 86400000);

  const seedOffset = normalizedPeriod === '2025' ? 19 : normalizedPeriod === '2026' ? 7 : 0;

  const days = [];
  const weeks = [];
  const months = [];
  let lastMonth = -1;

  let totalContributions = 0;
  let activeDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let peakCount = 0;
  let peakDate = '';

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate.getTime() + i * 86400000);
    const weekIndex = Math.floor(i / 7);
    const dayOfWeek = i % 7;

    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const dayNum = d.getUTCDate();
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const formattedDate = `${MONTH_NAMES[month]} ${dayNum}, ${year}`;

    if (dayOfWeek === 0 && month !== lastMonth) {
      if (months.length === 0 || weekIndex - months[months.length - 1].weekIndex >= 3) {
        months.push({ label: MONTH_NAMES[month], weekIndex });
      }
      lastMonth = month;
    }

    const milestone = findMilestone(isoDate);
    // Deterministic pseudo-random generator based on day index and period seed
    const hash = ((i + 11 + seedOffset) * 2654435761) >>> 0;
    const mod = hash % 100;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let count = 0;
    const activeThreshold = isWeekend ? 46 : 20;
    if (mod >= activeThreshold) {
      const baseCommits = (hash % 5) + 1;
      const sprintBonus = (weekIndex + seedOffset) % 3 === 0 ? Math.ceil(milestone.boost * 0.7) : Math.floor(milestone.boost * 0.35);
      count = Math.min(14, baseCommits + sprintBonus - (isWeekend ? 1 : 0));
      if (count < 1) count = 1;
    }

    const level = getContributionLevel(count);

    if (count > 0) {
      totalContributions += count;
      activeDays += 1;
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      if (count >= peakCount) {
        peakCount = count;
        peakDate = formattedDate;
      }
    } else {
      currentStreak = 0;
    }

    const dayRecord = {
      date: isoDate,
      formattedDate,
      count,
      level,
      weekIndex,
      dayOfWeek,
      focusArea: milestone.label
    };

    days.push(dayRecord);
    if (!weeks[weekIndex]) weeks[weekIndex] = [];
    weeks[weekIndex].push(dayRecord);
  }

  return {
    period: normalizedPeriod,
    weeks,
    days,
    months,
    stats: {
      totalContributions,
      activeDays,
      longestStreak,
      peakCount,
      peakDate
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════
   THREE.JS 3D SCENE KINEMATICS & THEME PALETTE LOGIC
   Pure functions shared with three-scene.js and unit tests
   ═══════════════════════════════════════════════════════════════════ */

export const THREE_SCENE_MODES = {
  workstation: {
    id: 'workstation',
    label: 'Full-Stack IDE',
    subtitle: '3D Developer Workstation · Python · React · JS · Node · MongoDB',
    explodeFactor: 1.0,
    orbitSpeed: 1.0,
    lidAngle: -0.28,
    ringTiltX: 0.16,
    ringTiltZ: 0.0,
    cameraOffset: { x: 0.0, y: 0.72, z: 6.1 }
  },
  frontend: {
    id: 'frontend',
    label: 'React & JS UI',
    subtitle: 'Frontend Architecture · React.js · JavaScript ES6+ · Tailwind',
    explodeFactor: 1.28,
    orbitSpeed: 1.35,
    lidAngle: -0.18,
    ringTiltX: 0.24,
    ringTiltZ: 0.12,
    cameraOffset: { x: -0.65, y: 0.82, z: 5.75 }
  },
  backend: {
    id: 'backend',
    label: 'Python & Node API',
    subtitle: 'Backend & DB · Python · Node.js · MongoDB · FastAPI',
    explodeFactor: 1.36,
    orbitSpeed: 1.45,
    lidAngle: -0.34,
    ringTiltX: 0.12,
    ringTiltZ: -0.14,
    cameraOffset: { x: 0.68, y: 0.64, z: 5.85 }
  },
  // Legacy aliases mapped cleanly
  core: {
    id: 'workstation',
    label: 'Full-Stack IDE',
    subtitle: '3D Developer Workstation · Python · React · JS · Node · MongoDB',
    explodeFactor: 1.0,
    orbitSpeed: 1.0,
    lidAngle: -0.28,
    ringTiltX: 0.16,
    ringTiltZ: 0.0,
    cameraOffset: { x: 0.0, y: 0.72, z: 6.1 }
  },
  api: {
    id: 'frontend',
    label: 'React & JS UI',
    subtitle: 'Frontend Architecture · React.js · JavaScript ES6+ · Tailwind',
    explodeFactor: 1.28,
    orbitSpeed: 1.35,
    lidAngle: -0.18,
    ringTiltX: 0.24,
    ringTiltZ: 0.12,
    cameraOffset: { x: -0.65, y: 0.82, z: 5.75 }
  },
  ai: {
    id: 'backend',
    label: 'Python & Node API',
    subtitle: 'Backend & DB · Python · Node.js · MongoDB · FastAPI',
    explodeFactor: 1.36,
    orbitSpeed: 1.45,
    lidAngle: -0.34,
    ringTiltX: 0.12,
    ringTiltZ: -0.14,
    cameraOffset: { x: 0.68, y: 0.64, z: 5.85 }
  }
};

export const RECOGNIZED_TECH_ICONS = [
  { id: 'python', name: 'Python', primaryHex: '#3776AB', accentHex: '#FFD43B', side: 'left-top' },
  { id: 'react', name: 'React', primaryHex: '#61DAFB', accentHex: '#00D8FF', side: 'left-bottom' },
  { id: 'javascript', name: 'JavaScript', primaryHex: '#F7DF1E', accentHex: '#111318', side: 'top-center' },
  { id: 'nodejs', name: 'Node.js', primaryHex: '#539E43', accentHex: '#83CD29', side: 'right-top' },
  { id: 'mongodb', name: 'MongoDB', primaryHex: '#10AA50', accentHex: '#B8E986', side: 'right-bottom' }
];

/**
 * Frame-rate independent exponential damping (THREE.MathUtils.damp equivalent)
 */
export function dampScalar(current, target, lambda = 6, dt = 0.016) {
  const c = Number(current) || 0;
  const t = Number(target) || 0;
  const k = Math.max(0, Number(lambda) || 0);
  const delta = Math.max(0, Number(dt) || 0);
  return c + (t - c) * (1 - Math.exp(-k * delta));
}

/**
 * Compute deterministic 3D workstation targets from active mode, scroll progress (0..1), and pointer (-1..1)
 */
export function computeThreeSceneKinematics({
  mode = 'workstation',
  scrollProgress = 0,
  pointerX = 0,
  pointerY = 0
} = {}) {
  const preset = THREE_SCENE_MODES[mode] || THREE_SCENE_MODES.workstation;
  const clampedScroll = Math.min(Math.max(Number(scrollProgress) || 0, 0), 1);
  const px = Math.min(Math.max(Number(pointerX) || 0, -1), 1);
  const py = Math.min(Math.max(Number(pointerY) || 0, -1), 1);

  const scrollTurn = clampedScroll * Math.PI * 0.55;
  const targetCameraX = preset.cameraOffset.x + px * 0.52;
  const targetCameraY = preset.cameraOffset.y + py * 0.34 + clampedScroll * 0.28;
  const targetCameraZ = preset.cameraOffset.z - Math.sin(clampedScroll * Math.PI) * 0.35;

  const targetGroupRotY = px * 0.32 - scrollTurn * 0.38;
  const targetGroupRotX = preset.ringTiltX - py * 0.18 + clampedScroll * 0.16;
  const targetExplode = preset.explodeFactor + Math.sin(clampedScroll * Math.PI) * 0.14;
  const targetLidAngle = preset.lidAngle - clampedScroll * 0.18;

  return {
    mode: preset.id,
    label: preset.label,
    subtitle: preset.subtitle,
    orbitSpeed: preset.orbitSpeed,
    ringTiltX: preset.ringTiltX,
    ringTiltZ: preset.ringTiltZ,
    targetLidAngle: Number(targetLidAngle.toFixed(4)),
    targetExplode: Number(targetExplode.toFixed(4)),
    targetGroupRotX: Number(targetGroupRotX.toFixed(4)),
    targetGroupRotY: Number(targetGroupRotY.toFixed(4)),
    targetCamera: {
      x: Number(targetCameraX.toFixed(4)),
      y: Number(targetCameraY.toFixed(4)),
      z: Number(targetCameraZ.toFixed(4))
    }
  };
}

/**
 * Return calibrated 3D PBR material and cinematic orange lighting colors for Dark vs Light mode
 */
export function getThreeSceneThemePalette(theme = 'dark') {
  const resolved = resolveThemeState(theme);
  if (resolved === 'light') {
    return {
      theme: 'light',
      fogColor: 0xf7f6f2,
      fogDensity: 0.025,
      coreMetalColor: 0x334155,
      statorColor: 0x475569,
      brandColor: 0xd9460f,
      cobaltColor: 0x0284c7,
      emeraldColor: 0x059669,
      wireOpacity: 0.20,
      keyLightIntensity: 2.9
    };
  }
  return {
    theme: 'dark',
    fogColor: 0x07080c,
    fogDensity: 0.028,
    coreMetalColor: 0x1e2430,
    statorColor: 0x12151e,
    brandColor: 0xff5500,
    cobaltColor: 0x38bdf8,
    emeraldColor: 0x10b981,
    wireOpacity: 0.28,
    keyLightIntensity: 3.1
  };
}


