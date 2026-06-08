/* ═══════════════════ script.js ═══════════════════ */

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR — desktop (pointer: fine) only
══════════════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const glow = document.getElementById('cursor-glow');
  if (!dot || !ring || !glow) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX  = mouseX, ringY  = mouseY;
  let glowX  = mouseX, glowY  = mouseY;

  const TRAIL_COUNT = 8;
  const trails = [];
  const trailPositions = Array.from({ length: TRAIL_COUNT }, () => ({ x: mouseX, y: mouseY }));

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    const size = 6 - i * 0.55;
    el.style.cssText = `width:${size}px;height:${size}px;opacity:${0.55 - i * 0.06};`;
    document.body.appendChild(el);
    trails.push(el);
  }

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function tick() {
    dot.style.transform  = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    ringX += (mouseX - ringX) * 0.13; ringY += (mouseY - ringY) * 0.13;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    glowX += (mouseX - glowX) * 0.07; glowY += (mouseY - glowY) * 0.07;
    glow.style.transform = `translate(calc(${glowX}px - 50%), calc(${glowY}px - 50%))`;

    trailPositions[0].x += (mouseX - trailPositions[0].x) * 0.35;
    trailPositions[0].y += (mouseY - trailPositions[0].y) * 0.35;
    for (let i = 1; i < TRAIL_COUNT; i++) {
      trailPositions[i].x += (trailPositions[i-1].x - trailPositions[i].x) * 0.4;
      trailPositions[i].y += (trailPositions[i-1].y - trailPositions[i].y) * 0.4;
    }
    trails.forEach((el, i) => {
      el.style.transform = `translate(calc(${trailPositions[i].x}px - 50%), calc(${trailPositions[i].y}px - 50%))`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const sel = 'a,button,[role="button"],input,textarea,select,label,.project-card,.social-link,.stat-item,.tech-card,.nav-link,.section-badge';
  document.addEventListener('mouseover', e => { if (e.target.closest(sel)) document.body.classList.add('cursor-hover'); }, { passive: true });
  document.addEventListener('mouseout',  e => { if (e.target.closest(sel)) document.body.classList.remove('cursor-hover'); }, { passive: true });
  document.addEventListener('mouseover', e => { if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') document.body.classList.add('cursor-text'); }, { passive: true });
  document.addEventListener('mouseout',  e => { if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') document.body.classList.remove('cursor-text'); }, { passive: true });
  document.addEventListener('mousedown', e => {
    document.body.classList.add('cursor-click');
    const burst = document.createElement('div');
    burst.className = 'cursor-burst';
    burst.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:36px;height:36px;`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 550);
  });
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = glow.style.opacity = '0'; trails.forEach(t => t.style.opacity='0'); });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = glow.style.opacity = ''; trails.forEach((t,i) => t.style.opacity=String(0.55-i*0.06)); });
})();

// ── Footer year ──
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
}, { passive: true });

// ── Active nav link ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop, height = section.offsetHeight, id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ── Mobile menu ──
const burgerBtn    = document.getElementById('burger-btn');
const mobileMenu   = document.getElementById('mobile-menu');
const mobileOverlay= document.getElementById('mobile-overlay');
const burgerIcon   = burgerBtn.querySelector('div');

function openMobileMenu()  { mobileMenu.classList.remove('hidden'); mobileMenu.classList.add('open'); burgerIcon.classList.add('burger-open'); burgerBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
function closeMobileMenu() { mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('open'); burgerIcon.classList.remove('burger-open'); burgerBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
burgerBtn.addEventListener('click', () => mobileMenu.classList.contains('hidden') ? openMobileMenu() : closeMobileMenu());
mobileOverlay.addEventListener('click', closeMobileMenu);
window.closeMobileMenu = closeMobileMenu;

/* ══════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════ */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  if (scrollProgress) scrollProgress.style.width = Math.min(pct, 100) + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ══════════════════════════════════════════════
   SCROLL REVEAL — all directions
══════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseFloat(el.dataset.delay || el.style.animationDelay || '0') * 1000;
    setTimeout(() => el.classList.add('visible'), delay);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.08, rootMargin: '-40px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-flip, .shine-card')
  .forEach(el => revealObserver.observe(el));

// Section headings scale in
document.querySelectorAll('.section-h2').forEach(el => {
  el.classList.add('reveal-scale');
  revealObserver.observe(el);
});

/* ══════════════════════════════════════════════
   STAGGERED CARD ENTRANCE
══════════════════════════════════════════════ */
function applyStagger(parent, childSel, baseDelay = 0.08) {
  if (!parent) return;
  parent.querySelectorAll(childSel).forEach((child, i) => {
    if (!child.classList.contains('reveal') && !child.classList.contains('reveal-scale')) {
      child.classList.add('reveal');
    }
    child.dataset.delay = (i * baseDelay).toFixed(2);
    revealObserver.observe(child);
  });
}
applyStagger(document.querySelector('.tech-grid'),     '.tech-card',    0.06);
applyStagger(document.querySelector('.projects-grid'), '.project-card', 0.08);

/* ══════════════════════════════════════════════
   ANIMATED STAT COUNTERS
══════════════════════════════════════════════ */
function animateCounter(el, target, suffix, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  function update() {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start) + suffix;
    if (start < target) requestAnimationFrame(update);
    else {
      el.textContent = target + suffix;
      el.classList.add('count-done');
      setTimeout(() => el.classList.remove('count-done'), 600);
    }
  }
  requestAnimationFrame(update);
}
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (!el.dataset.count) return;
    animateCounter(el, parseInt(el.dataset.count), el.dataset.suffix || '');
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

/* ══════════════════════════════════════════════
   3D TILT — tech cards (mouse + touch)
══════════════════════════════════════════════ */
const TILT_MAX = 12;
document.querySelectorAll('.tech-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform  = `perspective(600px) rotateY(${dx*TILT_MAX}deg) rotateX(${-dy*TILT_MAX}deg) scale(1.06)`;
    card.style.transition = 'transform .05s ease';
  }, { passive: true });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
  }, { passive: true });
  card.addEventListener('touchstart', () => { card.style.transform='scale(1.07)'; card.style.transition='transform .15s ease'; }, { passive: true });
  card.addEventListener('touchend',   () => { card.style.transform=''; card.style.transition='transform .3s ease'; }, { passive: true });
});

/* ══════════════════════════════════════════════
   MAGNETIC BUTTONS — desktop only
══════════════════════════════════════════════ */
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('.btn-primary, #back-to-top').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
      btn.style.transform  = `translate(${dx}px,${dy}px)`;
      btn.style.transition = 'transform .1s ease';
    }, { passive: true });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
    }, { passive: true });
  });
}

/* ══════════════════════════════════════════════
   FLOATING PARTICLES (canvas, 30fps, mobile-safe)
══════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.4;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 640;
  const COUNT  = isMobile ? 25 : 50;
  const COLORS = ['rgba(124,58,237,','rgba(139,92,246,','rgba(59,130,246,','rgba(167,139,250,'];
  let W, H, parts;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkP() { return { x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+0.4, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, c:COLORS[0|Math.random()*COLORS.length], a:Math.random()*.45+.1 }; }
  resize();
  parts = Array.from({ length:COUNT }, mkP);
  window.addEventListener('resize', resize, { passive: true });

  let last = 0;
  function draw(now) {
    if (now - last < 33) { requestAnimationFrame(draw); return; }
    last = now;
    ctx.clearRect(0, 0, W, H);

    // Lines
    for (let i = 0; i < parts.length; i++) {
      for (let j = i+1; j < parts.length; j++) {
        const dx = parts[i].x-parts[j].x, dy = parts[i].y-parts[j].y;
        const d  = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(parts[i].x,parts[i].y); ctx.lineTo(parts[j].x,parts[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${.06*(1-d/110)})`; ctx.lineWidth=.6; ctx.stroke();
        }
      }
    }
    // Dots
    parts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
      if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c+p.a+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ══════════════════════════════════════════════
   TYPEWRITER CODE EFFECT
══════════════════════════════════════════════ */
const codeLines = [
  'const mohan = new Developer();',
  'mohan.skills = ["MERN", "Python", "AI"];',
  'mohan.status = "Building Future";',
  'export default mohan; // 🚀',
];

function colorize(code) {
  return code
    .replace(/\/\/.*/g, m => `<span style="color:#6B7280">${m}</span>`)
    .replace(/"([^"]*)"/g, m => `<span style="color:#34D399">${m}</span>`)
    .replace(/\b(const|new|export|default)\b/g, m => `<span style="color:#A78BFA">${m}</span>`)
    .replace(/\b(Developer)\b/g, m => `<span style="color:#60A5FA">${m}</span>`);
}

function runTypewriter() {
  const el = document.getElementById('typewriter-code');
  if (!el) return;
  let displayed = '', lineIdx = 0, charIdx = 0;
  function type() {
    if (lineIdx >= codeLines.length) { el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>'; return; }
    const line = codeLines[lineIdx];
    if (charIdx < line.length) {
      displayed += line[charIdx++];
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
      setTimeout(type, 45);
    } else if (lineIdx < codeLines.length - 1) {
      displayed += '\n'; lineIdx++; charIdx = 0;
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
      setTimeout(type, 300);
    } else {
      el.innerHTML = colorize(displayed) + '<span class="typewriter-cursor">|</span>';
    }
  }
  setTimeout(type, 600);
}
runTypewriter();

/* ══════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════ */
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 400), { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════════
   CONTACT FORM — with instant loading bar
══════════════════════════════════════════════ */

// Animated progress bar inside the button
function startBtnProgress(btn) {
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  const bar = document.createElement('span');
  bar.id = 'btn-progress-bar';
  bar.style.cssText = `
    position:absolute;bottom:0;left:0;height:3px;width:0%;
    background:linear-gradient(90deg,#C4B5FD,#fff,#C4B5FD);
    background-size:200% auto;
    animation:shimmerMove 1.2s linear infinite;
    transition:width 8s linear;
    border-radius:0 0 8px 8px;
  `;
  btn.appendChild(bar);
  requestAnimationFrame(() => { bar.style.width = '95%'; });
}
function stopBtnProgress(btn) {
  const bar = document.getElementById('btn-progress-bar');
  if (bar) { bar.style.width = '100%'; setTimeout(() => bar.remove(), 300); }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const btn       = document.getElementById('submit-btn');
  const errEl     = document.getElementById('form-error');
  const form      = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const name      = document.getElementById('contact-name').value.trim();
  const email     = document.getElementById('contact-email').value.trim();
  const subject   = document.getElementById('contact-subject').value.trim();
  const message   = document.getElementById('contact-message').value.trim();

  if (!name || !email || !subject || !message) { showError('Please fill in all fields.'); return; }

  // Instant visual feedback
  btn.disabled = true;
  btn.innerHTML = `
    <span class="spinner"></span>
    <span>Sending your message…</span>
  `;
  errEl.classList.add('hidden');
  startBtnProgress(btn);

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });
    stopBtnProgress(btn);
    if (res.ok) {
      form.classList.add('hidden');
      successEl.classList.remove('hidden');
    } else {
      const data = await res.json().catch(() => ({}));
      showError(data.error || 'Failed to send. Please try again.');
      resetButton();
    }
  } catch {
    stopBtnProgress(btn);
    // Fallback: open mailto
    window.open(`mailto:mohansaini8772532@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`);
    form.classList.add('hidden');
    successEl.classList.remove('hidden');
  }
}
function showError(msg) { const el=document.getElementById('form-error'); el.textContent=msg; el.classList.remove('hidden'); }
function resetButton() { const btn=document.getElementById('submit-btn'); btn.disabled=false; btn.innerHTML=`<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Send Message`; }
function resetForm() { document.getElementById('contact-form').classList.remove('hidden'); document.getElementById('form-success').classList.add('hidden'); document.getElementById('contact-form').reset(); resetButton(); }
window.resetForm = resetForm;

/* ══════════════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
