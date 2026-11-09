// ═══════════════════════════════════════════════════════════════════
// script.js — Mohan Saini Portfolio Interactive Controller
// Uses shared pure logic from ./portfolio-logic.js
// ═══════════════════════════════════════════════════════════════════

import {
  PROJECTS_DATA,
  filterProjects,
  getProjectById,
  validateContactForm,
  resolveThemeState,
  generateContributionCalendar
} from './portfolio-logic.js';

/* ══════════════════════════════════════════════════════
   1. THEME TOGGLE — Dark / Light Mode
══════════════════════════════════════════════════════ */
(function initThemeToggle() {
  const STORAGE_KEY = 'ms-portfolio-theme';
  const btn = document.getElementById('theme-toggle');
  const tooltipEl = document.getElementById('lamp-tooltip-text');
  if (!btn) return;

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-mode', isLight);
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    if (tooltipEl) tooltipEl.textContent = isLight ? 'Light Theme' : 'Dark Theme';
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(resolveThemeState(saved));

  btn.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light-mode');
    const nextTheme = isLight ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  });
})();

/* ══════════════════════════════════════════════════════
   2. CUSTOM CURSOR — Desktop Fine Pointer Only
══════════════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  }, { passive: true });

  function updateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(updateRing);
  }
  requestAnimationFrame(updateRing);

  const interactiveSel = 'a, button, [role="button"], input, textarea, select, label';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSel)) document.body.classList.add('cursor-hover');
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSel)) document.body.classList.remove('cursor-hover');
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════
   3. NAVBAR SCROLL, ACTIVE SECTION & MOBILE DRAWER
══════════════════════════════════════════════════════ */
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = String(new Date().getFullYear());

const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScrollUpdate() {
  const scrollY = window.scrollY;
  if (navbar) navbar.classList.toggle('navbar-scrolled', scrollY > 36);
  if (backToTop) backToTop.classList.toggle('show', scrollY > 420);

  if (scrollProgress) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
  }

  const checkY = scrollY + 140;
  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    if (checkY >= top && checkY < top + height) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', onScrollUpdate, { passive: true });
onScrollUpdate();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Responsive Mobile & Tablet Drawer
const burgerBtn = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
const burgerIcon = burgerBtn ? burgerBtn.querySelector('div') : null;

function openMobileMenu() {
  if (!mobileMenu || !burgerBtn) return;
  mobileMenu.classList.remove('hidden');
  requestAnimationFrame(() => {
    mobileMenu.classList.add('open');
  });
  if (burgerIcon) burgerIcon.classList.add('burger-open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!mobileMenu || !burgerBtn) return;
  mobileMenu.classList.remove('open');
  mobileMenu.classList.add('hidden');
  if (burgerIcon) burgerIcon.classList.remove('burger-open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    if (mobileMenu.classList.contains('hidden')) openMobileMenu();
    else closeMobileMenu();
  });
}
if (mobileOverlay) {
  mobileOverlay.addEventListener('click', closeMobileMenu);
}
window.closeMobileMenu = closeMobileMenu;

/* ══════════════════════════════════════════════════════
   4. RESUME SPLIT-BUTTON DROPDOWNS
══════════════════════════════════════════════════════ */
(function initResumeDropdowns() {
  const pairs = [
    { caret: 'resume-caret-nav', dropdown: 'resume-dropdown-nav' },
    { caret: 'resume-caret-hero', dropdown: 'resume-dropdown-hero' }
  ];

  pairs.forEach(({ caret: caretId, dropdown: ddId }) => {
    const caret = document.getElementById(caretId);
    const dd = document.getElementById(ddId);
    if (!caret || !dd) return;

    function openDd() {
      dd.setAttribute('aria-hidden', 'false');
      caret.setAttribute('aria-expanded', 'true');
    }
    function closeDd() {
      dd.setAttribute('aria-hidden', 'true');
      caret.setAttribute('aria-expanded', 'false');
    }
    function toggleDd() {
      if (dd.getAttribute('aria-hidden') === 'false') closeDd();
      else openDd();
    }

    caret.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDd();
    });

    document.addEventListener('click', (e) => {
      if (caret.parentElement && !caret.parentElement.contains(e.target)) {
        closeDd();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDd();
    });

    dd.querySelectorAll('.rd-item').forEach((item) => {
      item.addEventListener('click', closeDd);
    });
  });
})();

/* ══════════════════════════════════════════════════════
   5. INTERACTIVE PROJECT FILTERING & CASE STUDY MODAL
══════════════════════════════════════════════════════ */
(function initProjectsAndModal() {
  const filterBtns = document.querySelectorAll('[data-project-filter]');
  const projectCards = document.querySelectorAll('#projects-grid .project-card');
  const statusEl = document.getElementById('project-filter-status');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-project-filter') || 'all';
      const matched = filterProjects(PROJECTS_DATA, category);
      const matchedIds = new Set(matched.map((p) => p.id));

      filterBtns.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      projectCards.forEach((card) => {
        const id = card.getAttribute('data-project-id');
        const visible = matchedIds.has(id);
        card.classList.toggle('hidden', !visible);
      });

      if (statusEl) {
        const labelMap = {
          all: 'Showing all 6 featured projects',
          'ai-platforms': 'Showing 3 AI platforms',
          realtime: 'Showing 2 real-time & operations applications',
          mern: 'Showing 1 MERN-stack productivity application'
        };
        statusEl.textContent = labelMap[category] || `Showing ${matched.length} projects`;
      }
    });
  });

  // Case Study Modal Controller
  const modal = document.getElementById('project-modal');
  const backdrop = document.getElementById('project-modal-backdrop');
  const closeBtn = document.getElementById('project-modal-close');
  const dismissBtn = document.getElementById('project-modal-dismiss');

  const idxEl = document.getElementById('modal-project-index');
  const catEl = document.getElementById('modal-project-category');
  const periodEl = document.getElementById('modal-project-period');
  const titleEl = document.getElementById('modal-project-title');
  const summaryEl = document.getElementById('modal-project-summary');
  const statusMetricEl = document.getElementById('modal-project-status');
  const metricsEl = document.getElementById('modal-project-metrics');
  const archEl = document.getElementById('modal-project-arch');
  const highlightsEl = document.getElementById('modal-project-highlights');
  const credsWrapEl = document.getElementById('modal-demo-creds-wrap');
  const credsEl = document.getElementById('modal-project-creds');
  const stackEl = document.getElementById('modal-project-stack');
  const urlEl = document.getElementById('modal-project-url');
  const githubEl = document.getElementById('modal-project-github');

  function openProjectModal(projectId) {
    const project = getProjectById(PROJECTS_DATA, projectId);
    if (!project || !modal) return;

    if (idxEl) idxEl.textContent = project.index;
    if (catEl) catEl.textContent = project.categoryLabel;
    if (periodEl) periodEl.textContent = project.period;
    if (titleEl) titleEl.textContent = project.title;
    if (summaryEl) summaryEl.textContent = project.summary;
    if (statusMetricEl) statusMetricEl.textContent = project.status;
    if (metricsEl) metricsEl.textContent = project.metrics;
    if (archEl) archEl.textContent = project.architecture;

    if (highlightsEl) {
      highlightsEl.innerHTML = project.highlights
        .map((item) => `<li>${item}</li>`)
        .join('');
    }

    if (credsWrapEl && credsEl) {
      if (project.demoCredentials) {
        credsEl.textContent =
          typeof project.demoCredentials === 'string'
            ? project.demoCredentials
            : `Email: ${project.demoCredentials.email}  ·  Password: ${project.demoCredentials.password}`;
        credsWrapEl.classList.remove('hidden');
      } else {
        credsEl.textContent = '';
        credsWrapEl.classList.add('hidden');
      }
    }

    if (stackEl) {
      stackEl.innerHTML = project.stack
        .map((tech, i) => `${i > 0 ? '<span aria-hidden="true">·</span>' : ''}<span>${tech}</span>`)
        .join(' ');
    }

    if (urlEl) {
      urlEl.setAttribute('href', project.url);
    }

    if (githubEl) {
      if (project.githubUrl) {
        githubEl.setAttribute('href', project.githubUrl);
        githubEl.classList.remove('hidden');
      } else {
        githubEl.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeProjectModal() {
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-project]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-open-project');
      openProjectModal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
  if (dismissBtn) dismissBtn.addEventListener('click', closeProjectModal);
  if (backdrop) backdrop.addEventListener('click', closeProjectModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeMobileMenu();
    }
  });
})();

/* ══════════════════════════════════════════════════════
   5B. GITHUB ACTIVITY CALENDAR VISUALIZATION (SVG / D3 Scale)
══════════════════════════════════════════════════════ */
(function initGitHubActivityCalendar() {
  const svg = document.getElementById('github-calendar-svg');
  const totalEl = document.getElementById('gh-stat-total');
  const activeEl = document.getElementById('gh-stat-active');
  const streakEl = document.getElementById('gh-stat-streak');
  const peakEl = document.getElementById('gh-stat-peak');
  const readoutEl = document.getElementById('gh-cell-readout');
  const periodBtns = document.querySelectorAll('[data-gh-period]');

  if (!svg) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CELL_SIZE = 11.5;
  const CELL_STEP = 14.8;
  const LEFT_PAD = 36;
  const TOP_PAD = 24;

  // D3-style linear coordinate scales for week (X) and weekday (Y)
  const xScale = (weekIndex) => LEFT_PAD + weekIndex * CELL_STEP;
  const yScale = (dayOfWeek) => TOP_PAD + dayOfWeek * CELL_STEP;

  function formatReadout(day) {
    if (!readoutEl || !day) return;
    const commitWord = day.count === 1 ? 'commit' : 'commits';
    readoutEl.innerHTML = `<strong>${day.formattedDate}</strong> · <strong>${day.count} ${commitWord}</strong> — ${day.focusArea}`;
  }

  function renderCalendar(period = 'last-year') {
    const data = generateContributionCalendar(period);

    if (totalEl) totalEl.textContent = data.stats.totalContributions.toLocaleString();
    if (activeEl) activeEl.textContent = `${data.stats.activeDays} Days`;
    if (streakEl) streakEl.textContent = `${data.stats.longestStreak} Days`;
    if (peakEl) peakEl.textContent = `${data.stats.peakCount} Commits`;

    svg.innerHTML = '';

    // 1. Month labels along top axis
    const monthsGroup = document.createElementNS(SVG_NS, 'g');
    monthsGroup.setAttribute('class', 'gh-months');
    data.months.forEach((m) => {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'gh-month-label');
      text.setAttribute('x', String(xScale(m.weekIndex)));
      text.setAttribute('y', '13');
      text.textContent = m.label;
      monthsGroup.appendChild(text);
    });
    svg.appendChild(monthsGroup);

    // 2. Weekday labels along left axis (Mon, Wed, Fri)
    const daysGroup = document.createElementNS(SVG_NS, 'g');
    daysGroup.setAttribute('class', 'gh-days-axis');
    const dayLabels = [
      { idx: 1, text: 'Mon' },
      { idx: 3, text: 'Wed' },
      { idx: 5, text: 'Fri' }
    ];
    dayLabels.forEach((d) => {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'gh-day-label');
      text.setAttribute('x', '2');
      text.setAttribute('y', String(yScale(d.idx) + 9));
      text.textContent = d.text;
      daysGroup.appendChild(text);
    });
    svg.appendChild(daysGroup);

    // 3. 52-week x 7-day heatmap cells
    const cellsGroup = document.createElementNS(SVG_NS, 'g');
    cellsGroup.setAttribute('class', 'gh-cells');

    let defaultSelectedDay = data.days[data.days.length - 1];
    data.days.forEach((day) => {
      if (day.count >= (defaultSelectedDay?.count || 0)) {
        defaultSelectedDay = day;
      }

      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', 'gh-cell');
      rect.setAttribute('x', String(xScale(day.weekIndex)));
      rect.setAttribute('y', String(yScale(day.dayOfWeek)));
      rect.setAttribute('width', String(CELL_SIZE));
      rect.setAttribute('height', String(CELL_SIZE));
      rect.setAttribute('data-level', String(day.level));
      rect.setAttribute('data-date', day.date);
      rect.setAttribute('data-count', String(day.count));
      rect.setAttribute('tabindex', '0');
      rect.setAttribute('role', 'gridcell');
      rect.setAttribute('aria-label', `${day.formattedDate}: ${day.count} commits (${day.focusArea})`);

      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = `${day.formattedDate}: ${day.count} commits — ${day.focusArea}`;
      rect.appendChild(title);

      const onInspect = () => {
        cellsGroup.querySelectorAll('.gh-cell.active-cell').forEach((el) => el.classList.remove('active-cell'));
        rect.classList.add('active-cell');
        formatReadout(day);
      };

      rect.addEventListener('mouseenter', onInspect);
      rect.addEventListener('focus', onInspect);
      rect.addEventListener('click', onInspect);

      cellsGroup.appendChild(rect);
    });

    svg.appendChild(cellsGroup);

    if (defaultSelectedDay) {
      formatReadout(defaultSelectedDay);
    }
  }

  periodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const period = btn.getAttribute('data-gh-period') || 'last-year';
      periodBtns.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });
      renderCalendar(period);
    });
  });

  renderCalendar('last-year');
})();

/* ══════════════════════════════════════════════════════
   6. INTERACTIVE TECH TOOLKIT FILTER
══════════════════════════════════════════════════════ */
(function initTechFilter() {
  const techBtns = document.querySelectorAll('[data-tech-filter]');
  const techCards = document.querySelectorAll('#tech-grid [data-tech-cat]');

  techBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-tech-filter') || 'all';
      techBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      techCards.forEach((card) => {
        const cardCat = card.getAttribute('data-tech-cat');
        const show = cat === 'all' || cardCat === cat;
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();

/* ══════════════════════════════════════════════════════
   7. CODE PROFILE CARD — Syntax Highlighting & Typewriter
══════════════════════════════════════════════════════ */
const codeLines = [
  'const engineer = {',
  '  name: "Mohan Saini",',
  '  role: "Full Stack Developer",',
  '  education: "B.Tech CSE (2023-2027)",',
  '  university: "Shobhit University",',
  '  stack: ["MERN", "Python", "Flask", "FastAPI"],',
  '  experience: ["Springer Capital", "Zaalima Development"],',
  '  impact: "300+ Users",',
  '  focus: "Scalable Web Applications & AI Systems"',
  '};'
];

function colorize(code) {
  return code
    .replace(/"([^"]*)"/g, '<span style="color:var(--brand-soft)">"$1"</span>')
    .replace(/\b(const)\b/g, '<span style="color:var(--cobalt)">$1</span>');
}

function runTypewriter() {
  const el = document.getElementById('typewriter-code');
  if (!el) return;
  let displayed = '';
  let lineIdx = 0;
  let charIdx = 0;

  function step() {
    if (lineIdx >= codeLines.length) {
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
      return;
    }
    const line = codeLines[lineIdx];
    if (charIdx < line.length) {
      displayed += line[charIdx++];
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
      setTimeout(step, 6);
    } else if (lineIdx < codeLines.length - 1) {
      displayed += '\n';
      lineIdx++;
      charIdx = 0;
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
      setTimeout(step, 25);
    } else {
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
    }
  }
  setTimeout(step, 80);
}
runTypewriter();

/* ══════════════════════════════════════════════════════
   8. CONTACT FORM VALIDATION & SUBMISSION
══════════════════════════════════════════════════════ */
async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const errEl = document.getElementById('form-error');
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');

  const rawPayload = {
    name: document.getElementById('contact-name')?.value,
    email: document.getElementById('contact-email')?.value,
    subject: document.getElementById('contact-subject')?.value,
    message: document.getElementById('contact-message')?.value
  };

  const validation = validateContactForm(rawPayload);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  const { name, email, subject, message } = validation.data;

  if (errEl) errEl.classList.add('hidden');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span><span>Dispatching Inquiry...</span>';
  }

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });

    if (res.ok) {
      if (form) form.classList.add('hidden');
      if (successEl) successEl.classList.remove('hidden');
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 || res.status === 500) {
        if (form) form.classList.add('hidden');
        if (successEl) successEl.classList.remove('hidden');
      } else {
        showError(data.error || 'Unable to send message. Please check your inputs and try again.');
        resetButton();
      }
    }
  } catch {
    if (form) form.classList.add('hidden');
    if (successEl) successEl.classList.remove('hidden');
  }
}

function showError(msg) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function resetButton() {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = `
    <span>Send Message</span>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  `;
}

function resetForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const errEl = document.getElementById('form-error');
  if (form) {
    form.reset();
    form.classList.remove('hidden');
  }
  if (successEl) successEl.classList.add('hidden');
  if (errEl) errEl.classList.add('hidden');
  resetButton();
}

window.handleFormSubmit = handleFormSubmit;
window.resetForm = resetForm;
