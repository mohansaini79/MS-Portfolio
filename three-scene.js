// ═══════════════════════════════════════════════════════════════════
// three-scene.js — Interactive 3D Developer Workstation & Cross-Section FX
// Mohan Saini Portfolio · Realistic 3D Laptop Displaying Code +
// Recognizable 3D Tech Icons (Python, React, JavaScript, Node.js, MongoDB)
// + Cinematic Orange Lighting & Subtle Cross-Section Three.js Effects
// ═══════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  THREE_SCENE_MODES,
  RECOGNIZED_TECH_ICONS,
  dampScalar,
  computeThreeSceneKinematics,
  getThreeSceneThemePalette
} from './portfolio-logic.js';

// Pre-allocated scratch math helpers (Zero GC allocations in render loop)
const _dummyObj = new THREE.Object3D();
const _scratchColor = new THREE.Color();

/**
 * Detect software WebGL (SwiftShader, llvmpipe, softpipe, Basic Render)
 */
function detectSoftwareWebGL() {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Helper to create a rounded rectangle THREE.Shape for beveled ExtrudeGeometry parts
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Generate High-DPI Live IDE Code Screen CanvasTexture (1024x640, SRGBColorSpace + maxAnisotropy)
 */
function createLaptopCodeScreenTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // IDE Background
  ctx.fillStyle = '#0B0E17';
  ctx.fillRect(0, 0, 1024, 640);

  // Top Window Title Bar
  ctx.fillStyle = '#131724';
  ctx.fillRect(0, 0, 1024, 42);
  ctx.strokeStyle = 'rgba(255, 85, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.lineTo(1024, 42);
  ctx.stroke();

  // Window Traffic Dots
  const dots = [
    { x: 24, c: '#FF5F56' },
    { x: 46, c: '#FFBD2E' },
    { x: 68, c: '#27C93F' }
  ];
  dots.forEach((d) => {
    ctx.fillStyle = d.c;
    ctx.beginPath();
    ctx.arc(d.x, 21, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Active IDE Tabs
  const tabs = [
    { label: 'server.py', active: true, x: 190, w: 145, dot: '#3776AB' },
    { label: 'App.jsx', active: false, x: 342, w: 135, dot: '#61DAFB' },
    { label: 'api.node.js', active: false, x: 484, w: 150, dot: '#539E43' },
    { label: 'mongo.db.js', active: false, x: 642, w: 155, dot: '#10AA50' }
  ];
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  tabs.forEach((t) => {
    ctx.fillStyle = t.active ? '#1B2133' : '#101420';
    ctx.fillRect(t.x, 6, t.w, 35);
    if (t.active) {
      ctx.fillStyle = '#FF5500';
      ctx.fillRect(t.x, 6, t.w, 3);
    }
    ctx.fillStyle = t.dot;
    ctx.beginPath();
    ctx.arc(t.x + 18, 24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.active ? '#F8FAFC' : '#94A3B8';
    ctx.fillText(t.label, t.x + 30, 29);
  });

  // Left File Explorer Sidebar
  ctx.fillStyle = '#0E121D';
  ctx.fillRect(0, 43, 182, 597);
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
  ctx.beginPath();
  ctx.moveTo(182, 43);
  ctx.lineTo(182, 640);
  ctx.stroke();

  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FF7833';
  ctx.fillText('PORTFOLIO STACK', 16, 72);

  const sidebarFiles = [
    { name: '▸ src/components', c: '#94A3B8' },
    { name: '  • App.jsx', c: '#61DAFB' },
    { name: '  • Dashboard.ts', c: '#F7DF1E' },
    { name: '▸ backend/api', c: '#94A3B8' },
    { name: '  • server.py', c: '#FFD43B' },
    { name: '  • node_auth.js', c: '#68A063' },
    { name: '  • mongodb.js', c: '#10AA50' },
    { name: '  • Dockerfile', c: '#38BDF8' }
  ];
  ctx.font = '13px "JetBrains Mono", monospace';
  sidebarFiles.forEach((f, idx) => {
    ctx.fillStyle = f.c;
    ctx.fillText(f.name, 14, 102 + idx * 28);
  });

  // Main Code Editor Area (Syntax-Highlighted Full-Stack Code)
  const codeLines = [
    { ln: '01', tokens: [{ t: 'import ', c: '#FF7833' }, { t: '{ FastAPI } ', c: '#F8FAFC' }, { t: 'from ', c: '#FF7833' }, { t: '"fastapi"', c: '#A3E635' }, { t: ';  // Python + MERN Stack', c: '#64748B' }] },
    { ln: '02', tokens: [{ t: 'import ', c: '#FF7833' }, { t: 'React, { useEffect } ', c: '#61DAFB' }, { t: 'from ', c: '#FF7833' }, { t: '"react"', c: '#A3E635' }, { t: ';', c: '#94A3B8' }] },
    { ln: '03', tokens: [{ t: 'import ', c: '#FF7833' }, { t: '{ MongoClient } ', c: '#10AA50' }, { t: 'from ', c: '#FF7833' }, { t: '"mongodb"', c: '#A3E635' }, { t: ';', c: '#94A3B8' }] },
    { ln: '04', tokens: [{ t: '', c: '#64748B' }] },
    { ln: '05', tokens: [{ t: 'export const ', c: '#38BDF8' }, { t: 'engineer ', c: '#F8FAFC' }, { t: '= {', c: '#FFD43B' }] },
    { ln: '06', tokens: [{ t: '  name: ', c: '#C8CDD9' }, { t: '"Mohan Saini"', c: '#FF7833' }, { t: ',', c: '#94A3B8' }] },
    { ln: '07', tokens: [{ t: '  role: ', c: '#C8CDD9' }, { t: '"Full Stack Developer"', c: '#38BDF8' }, { t: ',', c: '#94A3B8' }] },
    { ln: '08', tokens: [{ t: '  stack: ', c: '#C8CDD9' }, { t: '["Python", "React", "JavaScript", "Node.js", "MongoDB"]', c: '#A3E635' }, { t: ',', c: '#94A3B8' }] },
    { ln: '09', tokens: [{ t: '  productionUsers: ', c: '#C8CDD9' }, { t: '300', c: '#FF5500' }, { t: ', // Shobhit Exam Portal + SmartCV', c: '#64748B' }] },
    { ln: '10', tokens: [{ t: '  latencyReduction: ', c: '#C8CDD9' }, { t: '"35% faster REST APIs"', c: '#FFD43B' }] },
    { ln: '11', tokens: [{ t: '};', c: '#FFD43B' }] },
    { ln: '12', tokens: [{ t: '', c: '#64748B' }] },
    { ln: '13', tokens: [{ t: 'async function ', c: '#FF7833' }, { t: 'bootProductionCluster', c: '#61DAFB' }, { t: '() {', c: '#F8FAFC' }] },
    { ln: '14', tokens: [{ t: '  await ', c: '#FF7833' }, { t: 'MongoClient.connect(process.env.MONGO_ATLAS_URI);', c: '#E2E8F0' }] },
    { ln: '15', tokens: [{ t: '  return ', c: '#FF7833' }, { t: '{ status: "LIVE", uptime: "99.9%", ws: true };', c: '#10B981' }] },
    { ln: '16', tokens: [{ t: '}', c: '#F8FAFC' }] }
  ];

  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  codeLines.forEach((row, idx) => {
    const y = 78 + idx * 24;
    if (idx === 7) {
      ctx.fillStyle = 'rgba(255, 85, 0, 0.11)';
      ctx.fillRect(184, y - 17, 840, 24);
      ctx.fillStyle = '#FF5500';
      ctx.fillRect(184, y - 17, 3, 24);
    }
    ctx.fillStyle = '#475569';
    ctx.fillText(row.ln, 198, y);

    let cursorX = 238;
    row.tokens.forEach((tk) => {
      ctx.fillStyle = tk.c;
      ctx.fillText(tk.t, cursorX, y);
      cursorX += ctx.measureText(tk.t).width;
    });
  });

  // Bottom Integrated Terminal Panel
  ctx.fillStyle = '#090C14';
  ctx.fillRect(183, 476, 841, 164);
  ctx.strokeStyle = 'rgba(255, 85, 0, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(183, 476);
  ctx.lineTo(1024, 476);
  ctx.stroke();

  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FF5500';
  ctx.fillText('TERMINAL · ZSH', 204, 502);
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('PORTS: 3000 (React) · 8000 (FastAPI) · 27017 (MongoDB)', 360, 502);

  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText('➜  ms-portfolio git:(main) ✓ node server.js && uvicorn api:app', 204, 534);
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('[FastAPI + Node.js] Connected to MongoDB Atlas cluster0 (99.9% uptime)', 204, 562);
  ctx.fillStyle = '#FF7833';
  ctx.fillText('⚡ Serving 300+ active users · Sub-100ms WebSocket & REST APIs ready █', 204, 592);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generate Backlit Mechanical Keyboard CanvasTexture (1024x512, SRGBColorSpace + maxAnisotropy)
 */
function createKeyboardTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Recessed dark anodized aluminum well
  ctx.fillStyle = '#0B0D13';
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle orange under-key backlight glow
  const glow = ctx.createRadialGradient(512, 256, 40, 512, 256, 480);
  glow.addColorStop(0, 'rgba(255, 85, 0, 0.25)');
  glow.addColorStop(0.6, 'rgba(56, 189, 248, 0.10)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 512);

  const rows = 6;
  const cols = 15;
  const padX = 28;
  const padY = 26;
  const gap = 8;
  const keyW = (1024 - padX * 2 - gap * (cols - 1)) / cols;
  const keyH = (512 - padY * 2 - gap * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Spacebar merge on bottom row
      if (r === 5 && c >= 4 && c <= 9) {
        if (c === 4) {
          const sbW = keyW * 6 + gap * 5;
          const kx = padX + c * (keyW + gap);
          const ky = padY + r * (keyH + gap);
          ctx.fillStyle = '#181C26';
          ctx.fillRect(kx, ky, sbW, keyH);
          ctx.strokeStyle = 'rgba(255, 120, 51, 0.45)';
          ctx.lineWidth = 2;
          ctx.strokeRect(kx, ky, sbW, keyH);
        }
        continue;
      }

      const kx = padX + c * (keyW + gap);
      const ky = padY + r * (keyH + gap);
      const isOrangeKey = (r === 0 && c === 0) || (r === 2 && c === 14) || (r === 5 && c >= 12);

      ctx.fillStyle = isOrangeKey ? '#EA4C00' : '#161A24';
      ctx.fillRect(kx, ky, keyW, keyH);

      ctx.strokeStyle = isOrangeKey ? '#FF945C' : 'rgba(226, 232, 240, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(kx, ky, keyW, keyH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generate Recognizable High-DPI Tech Icon Badge Texture (512x512, SRGBColorSpace + maxAnisotropy)
 * Supports: 'python', 'react', 'javascript', 'nodejs', 'mongodb'
 */
function createTechIconTexture(renderer, techId) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const cx = 256;
  const cy = 224;

  // Dark obsidian medallion face with radial glow
  ctx.fillStyle = '#0D111A';
  ctx.fillRect(0, 0, 512, 512);

  const drawBadgeFrame = (borderColor, glowColor, labelText) => {
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'rgba(13, 17, 26, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Outer precision ring
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(256, 256, 236, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom tech name pill
    ctx.fillStyle = 'rgba(15, 19, 29, 0.92)';
    ctx.fillRect(96, 382, 320, 62);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(96, 382, 320, 62);

    ctx.font = 'bold 34px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(labelText, 256, 414);
  };

  if (techId === 'python') {
    drawBadgeFrame('#FFD43B', 'rgba(55, 118, 171, 0.35)', 'Python');
    // Top-left Blue Snake
    ctx.fillStyle = '#3776AB';
    ctx.beginPath();
    ctx.roundRect(176, 104, 110, 96, 28);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(136, 148, 150, 76, 24);
    ctx.fill();
    // Bottom-right Yellow Snake
    ctx.fillStyle = '#FFD43B';
    ctx.beginPath();
    ctx.roundRect(226, 224, 110, 96, 28);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(226, 200, 150, 76, 24);
    ctx.fill();
    // Snake eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(204, 130, 8, 0, Math.PI * 2);
    ctx.arc(308, 294, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (techId === 'react') {
    drawBadgeFrame('#61DAFB', 'rgba(97, 218, 251, 0.32)', 'React');
    ctx.strokeStyle = '#61DAFB';
    ctx.lineWidth = 11;
    [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((angle) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 118, 44, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle = '#61DAFB';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
  } else if (techId === 'javascript') {
    drawBadgeFrame('#F7DF1E', 'rgba(247, 223, 30, 0.32)', 'JavaScript');
    // Iconic Yellow JS Square
    ctx.fillStyle = '#F7DF1E';
    ctx.beginPath();
    ctx.roundRect(148, 112, 216, 216, 22);
    ctx.fill();
    ctx.fillStyle = '#111318';
    ctx.font = '900 112px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('JS', 346, 304);
  } else if (techId === 'nodejs') {
    drawBadgeFrame('#68A063', 'rgba(104, 160, 99, 0.34)', 'Node.js');
    // Green Hexagon Shield
    ctx.fillStyle = '#539E43';
    ctx.beginPath();
    const hexR = 116;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const hx = cx + Math.cos(a) * hexR;
      const hy = cy + Math.sin(a) * hexR;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#A3E635';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JS', cx, cy + 4);
  } else if (techId === 'mongodb') {
    drawBadgeFrame('#10AA50', 'rgba(16, 170, 80, 0.34)', 'MongoDB');
    // Iconic Green MongoDB Leaf
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#10AA50';
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.bezierCurveTo(68, -60, 74, 42, 0, 108);
    ctx.bezierCurveTo(-74, 42, -68, -60, 0, -118);
    ctx.fill();

    // Right leaf highlight half
    ctx.fillStyle = '#47A248';
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.bezierCurveTo(68, -60, 74, 42, 0, 108);
    ctx.lineTo(0, -118);
    ctx.fill();

    // Central stem vein
    ctx.strokeStyle = '#ECFDF5';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -96);
    ctx.lineTo(0, 122);
    ctx.stroke();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generate Soft Radial Cinematic Orange Contact Shadow & Workstation Grid Texture
 */
function createWorkstationFloorTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const cx = 256;
  const cy = 256;

  const grad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 248);
  grad.addColorStop(0, 'rgba(255, 85, 0, 0.34)');
  grad.addColorStop(0.42, 'rgba(7, 8, 12, 0.72)');
  grad.addColorStop(0.78, 'rgba(56, 189, 248, 0.08)');
  grad.addColorStop(1, 'rgba(7, 8, 12, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle architectural grid lines & concentric rings
  ctx.strokeStyle = 'rgba(255, 120, 51, 0.24)';
  ctx.lineWidth = 1.5;
  [90, 156, 224].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
  return texture;
}

/**
 * Build the Composite Multi-Part 3D Developer Workstation + 5 Recognizable Tech Icons
 */
function buildDeveloperWorkstation(renderer, materials, textures) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'DeveloperWorkstation3D';
  const disposableGeometries = [];

  // ── 1. Grounded Desk Mat & Cinematic Orange Underglow Rim ──
  const deskShape = createRoundedRectShape(4.7, 2.9, 0.32);
  const deskGeo = new THREE.ExtrudeGeometry(deskShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.025
  });
  deskGeo.center();
  deskGeo.computeVertexNormals();
  disposableGeometries.push(deskGeo);

  const deskPad = new THREE.Mesh(deskGeo, materials.deskMat);
  deskPad.rotation.x = Math.PI / 2;
  deskPad.position.set(0, -1.08, 0.05);
  rootGroup.add(deskPad);

  // Glowing Orange Desk Underglow Strip
  const underglowGeo = new THREE.BoxGeometry(4.4, 0.025, 2.65);
  disposableGeometries.push(underglowGeo);
  const underglowMesh = new THREE.Mesh(underglowGeo, materials.brandEmissive);
  underglowMesh.position.set(0, -1.12, 0.05);
  rootGroup.add(underglowMesh);

  // ── 2. Realistic Multi-Part 3D Pro Laptop Assembly ──
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0, -0.98, 0.18);
  rootGroup.add(laptopGroup);

  // 2a. Unibody Aluminum Base Chassis (Beveled ExtrudeGeometry)
  const baseWidth = 2.68;
  const baseDepth = 1.78;
  const baseShape = createRoundedRectShape(baseWidth, baseDepth, 0.14);
  const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.025
  });
  baseGeo.center();
  baseGeo.computeVertexNormals();
  disposableGeometries.push(baseGeo);

  const laptopBase = new THREE.Mesh(baseGeo, materials.laptopAluminum);
  laptopBase.rotation.x = Math.PI / 2;
  laptopGroup.add(laptopBase);

  // 2b. Backlit Mechanical Keyboard Surface
  const kbGeo = new THREE.PlaneGeometry(2.34, 0.98);
  disposableGeometries.push(kbGeo);
  const kbMesh = new THREE.Mesh(kbGeo, materials.keyboardSurface);
  kbMesh.rotation.x = -Math.PI / 2;
  kbMesh.position.set(0, 0.072, -0.20);
  laptopGroup.add(kbMesh);

  // 2c. Precision Glass Force-Touch Trackpad
  const tpGeo = new THREE.PlaneGeometry(0.82, 0.46);
  disposableGeometries.push(tpGeo);
  const tpMesh = new THREE.Mesh(tpGeo, materials.trackpadGlass);
  tpMesh.rotation.x = -Math.PI / 2;
  tpMesh.position.set(0, 0.073, 0.56);
  laptopGroup.add(tpMesh);

  // 2d. Cylindrical Rear Hinge Barrel
  const hingeGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.05, 20);
  disposableGeometries.push(hingeGeo);
  const hingeMesh = new THREE.Mesh(hingeGeo, materials.hingeDarkMetal);
  hingeMesh.rotation.z = Math.PI / 2;
  hingeMesh.position.set(0, 0.06, -baseDepth / 2 + 0.04);
  laptopGroup.add(hingeMesh);

  // 2e. Hinged Display Lid Group (pivoted at rear hinge so it opens/tilts smoothly)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.06, -baseDepth / 2 + 0.04);
  laptopGroup.add(lidPivot);

  const screenHeight = 1.72;
  const lidGeo = new THREE.ExtrudeGeometry(
    createRoundedRectShape(baseWidth, screenHeight, 0.14),
    {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.018
    }
  );
  lidGeo.center();
  lidGeo.computeVertexNormals();
  disposableGeometries.push(lidGeo);

  const lidShell = new THREE.Mesh(lidGeo, materials.laptopAluminum);
  lidShell.position.set(0, screenHeight / 2, -0.02);
  lidPivot.add(lidShell);

  // Glossy Dark Bezel Frame
  const bezelGeo = new THREE.PlaneGeometry(baseWidth - 0.08, screenHeight - 0.08);
  disposableGeometries.push(bezelGeo);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.screenBezel);
  bezelMesh.position.set(0, screenHeight / 2, 0.024);
  lidPivot.add(bezelMesh);

  // Live Syntax-Highlighted Code Screen
  const displayGeo = new THREE.PlaneGeometry(baseWidth - 0.20, screenHeight - 0.22);
  disposableGeometries.push(displayGeo);
  const displayMesh = new THREE.Mesh(displayGeo, materials.codeScreen);
  displayMesh.position.set(0, screenHeight / 2 - 0.01, 0.028);
  lidPivot.add(displayMesh);

  // Top Webcam Indicator Dot
  const camDotGeo = new THREE.CircleGeometry(0.018, 12);
  disposableGeometries.push(camDotGeo);
  const camDot = new THREE.Mesh(camDotGeo, materials.brandEmissive);
  camDot.position.set(0, screenHeight - 0.07, 0.029);
  lidPivot.add(camDot);

  // ── 3. Desk Props: Developer Coffee Mug (LatheGeometry + Torus Handle) ──
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-1.82, -1.02, 0.42);
  const mugProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.22, 0.0),
    new THREE.Vector2(0.24, 0.48),
    new THREE.Vector2(0.21, 0.48),
    new THREE.Vector2(0.19, 0.05),
    new THREE.Vector2(0.0, 0.05)
  ];
  const mugBodyGeo = new THREE.LatheGeometry(mugProfile, 24);
  mugBodyGeo.computeVertexNormals();
  disposableGeometries.push(mugBodyGeo);
  const mugBody = new THREE.Mesh(mugBodyGeo, materials.mugCeramic);
  mugGroup.add(mugBody);

  const mugRimGeo = new THREE.TorusGeometry(0.225, 0.018, 12, 32);
  disposableGeometries.push(mugRimGeo);
  const mugRim = new THREE.Mesh(mugRimGeo, materials.brandEmissive);
  mugRim.rotation.x = Math.PI / 2;
  mugRim.position.y = 0.48;
  mugGroup.add(mugRim);

  const mugHandleGeo = new THREE.TorusGeometry(0.12, 0.025, 12, 24, Math.PI);
  disposableGeometries.push(mugHandleGeo);
  const mugHandle = new THREE.Mesh(mugHandleGeo, materials.mugCeramic);
  mugHandle.rotation.z = -Math.PI / 2;
  mugHandle.position.set(-0.22, 0.25, 0);
  mugGroup.add(mugHandle);
  rootGroup.add(mugGroup);

  // ── 4. 5 Recognizable 3D Technology Icon Badges (Python, React, JS, Node.js, MongoDB) ──
  const techBadgesGroup = new THREE.Group();
  rootGroup.add(techBadgesGroup);

  const badgeConfigs = [
    {
      id: 'python',
      name: 'Python',
      basePos: new THREE.Vector3(-2.35, 0.72, -0.15),
      rimColor: 0xffd43b,
      phase: 0.0
    },
    {
      id: 'react',
      name: 'React',
      basePos: new THREE.Vector3(-2.05, -0.18, 0.55),
      rimColor: 0x61dafb,
      phase: 1.25
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      basePos: new THREE.Vector3(0.0, 1.38, -0.35),
      rimColor: 0xf7df1e,
      phase: 2.45
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      basePos: new THREE.Vector3(2.32, 0.68, -0.12),
      rimColor: 0x68a063,
      phase: 3.65
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      basePos: new THREE.Vector3(2.02, -0.22, 0.52),
      rimColor: 0x10aa50,
      phase: 4.85
    }
  ];

  const badgeBodyGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.11, 36);
  badgeBodyGeo.rotateX(Math.PI / 2);
  disposableGeometries.push(badgeBodyGeo);

  const badgeFaceGeo = new THREE.CircleGeometry(0.43, 36);
  disposableGeometries.push(badgeFaceGeo);

  const badgeRimGeo = new THREE.TorusGeometry(0.46, 0.028, 16, 48);
  disposableGeometries.push(badgeRimGeo);

  const techBadges = [];
  const badgeMaterials = [];

  badgeConfigs.forEach((cfg) => {
    const bGroup = new THREE.Group();
    bGroup.position.copy(cfg.basePos);

    // Metallic 3D Medallion Housing
    const housing = new THREE.Mesh(badgeBodyGeo, materials.badgeHousing);
    bGroup.add(housing);

    // Glowing Brand-Colored Outer Torus Rim
    const rimMat = new THREE.MeshStandardMaterial({
      color: cfg.rimColor,
      emissive: cfg.rimColor,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.82
    });
    badgeMaterials.push(rimMat);
    const rimMesh = new THREE.Mesh(badgeRimGeo, rimMat);
    bGroup.add(rimMesh);

    // Front & Back High-DPI Tech Icon Faces
    const iconTex = textures.techIcons[cfg.id];
    const faceMat = new THREE.MeshBasicMaterial({
      map: iconTex
    });
    badgeMaterials.push(faceMat);

    const frontFace = new THREE.Mesh(badgeFaceGeo, faceMat);
    frontFace.position.z = 0.058;
    bGroup.add(frontFace);

    const backFace = new THREE.Mesh(badgeFaceGeo, faceMat);
    backFace.rotation.y = Math.PI;
    backFace.position.z = -0.058;
    bGroup.add(backFace);

    // Connect each tech badge to the laptop via a glowing orange/cobalt spline conduit
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.55, 0.0),
      new THREE.Vector3(cfg.basePos.x * 0.55, cfg.basePos.y * 0.35 - 0.3, cfg.basePos.z * 0.5),
      cfg.basePos.clone()
    ]);
    const conduitGeo = new THREE.TubeGeometry(curve, 16, 0.012, 6, false);
    disposableGeometries.push(conduitGeo);
    const conduitMesh = new THREE.Mesh(conduitGeo, materials.conduitGlow);
    rootGroup.add(conduitMesh);

    techBadgesGroup.add(bGroup);
    techBadges.push({
      id: cfg.id,
      name: cfg.name,
      group: bGroup,
      basePos: cfg.basePos.clone(),
      phase: cfg.phase
    });
  });

  // ── 5. Orbiting Ambient Data Particles (InstancedMesh of 36 Subtle Micro-Cubes) ──
  const particleCount = 36;
  const particleGeo = new THREE.OctahedronGeometry(0.045, 0);
  disposableGeometries.push(particleGeo);
  const instancedParticles = new THREE.InstancedMesh(
    particleGeo,
    materials.particleMat,
    particleCount
  );
  instancedParticles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instancedParticles.frustumCulled = false;

  const particleOrbits = [];
  const pColors = [0xff5500, 0x38bdf8, 0xf7df1e, 0x61dafb, 0x10aa50];
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.55 + (i % 4) * 0.48;
    const theta = (i / particleCount) * Math.PI * 2;
    const yBase = ((i % 6) - 2.5) * 0.36;
    const speed = (0.24 + (i % 4) * 0.08) * (i % 2 === 0 ? 1 : -1);
    const scale = 0.75 + (i % 3) * 0.2;
    particleOrbits.push({ radius, theta, yBase, speed, scale, phase: i * 0.5 });

    _dummyObj.position.set(Math.cos(theta) * radius, yBase, Math.sin(theta) * radius);
    _dummyObj.scale.setScalar(scale);
    _dummyObj.updateMatrix();
    instancedParticles.setMatrixAt(i, _dummyObj.matrix);

    _scratchColor.setHex(pColors[i % pColors.length]);
    instancedParticles.setColorAt(i, _scratchColor);
  }
  instancedParticles.instanceMatrix.needsUpdate = true;
  if (instancedParticles.instanceColor) instancedParticles.instanceColor.needsUpdate = true;
  instancedParticles.computeBoundingSphere();
  rootGroup.add(instancedParticles);

  // ── 6. Grounded Contact Shadow & Cinematic Orange Floor Grid ──
  const floorGeo = new THREE.PlaneGeometry(7.6, 5.2);
  disposableGeometries.push(floorGeo);
  const floorDisc = new THREE.Mesh(floorGeo, materials.workstationFloor);
  floorDisc.rotation.x = -Math.PI / 2;
  floorDisc.position.y = -1.14;
  floorDisc.renderOrder = -1;
  rootGroup.add(floorDisc);

  return {
    rootGroup,
    parts: {
      laptopGroup,
      lidPivot,
      mugGroup,
      techBadges,
      instancedParticles,
      underglowMesh
    },
    particleOrbits,
    geometries: disposableGeometries,
    extraMaterials: badgeMaterials
  };
}

/**
 * Initialize Subtle Cross-Section Three.js Ambient Field & Section Scroll Depth
 * Adds an atmospheric canvas layer across Projects, Experience, Toolkit, About, and Contact
 */
function initCrossSectionAmbientField(initialTheme = 'dark') {
  const ambientMount = document.getElementById('three-ambient-mount');
  if (!ambientMount) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'three-ambient-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  ambientMount.innerHTML = '';
  ambientMount.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  let theme = initialTheme;

  const nodes = Array.from({ length: 28 }, (_, i) => ({
    x: ((i * 137.5) % 100) / 100,
    y: ((i * 73.1) % 100) / 100,
    z: 0.35 + (i % 5) * 0.16,
    radius: 1.6 + (i % 3) * 1.1,
    isBrand: i % 3 !== 0
  }));

  function resize() {
    width = Math.max(window.innerWidth, 300);
    height = Math.max(window.innerHeight, 300);
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function renderField(scrollProgress, pointerX, pointerY, timeSec) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const isLight = theme === 'light';
    const brandRgb = isLight ? '217, 70, 15' : '255, 85, 0';
    const cobaltRgb = isLight ? '2, 132, 199' : '56, 189, 248';

    // Subtle 3D perspective horizon beam that shifts with scroll across sections
    const beamY = height * (0.22 + ((scrollProgress * 1.4) % 0.65));
    const grad = ctx.createRadialGradient(
      width * (0.5 + pointerX * 0.12),
      beamY,
      20,
      width * 0.5,
      beamY,
      Math.max(width, height) * 0.52
    );
    grad.addColorStop(0, `rgba(${brandRgb}, ${isLight ? 0.055 : 0.075})`);
    grad.addColorStop(0.5, `rgba(${cobaltRgb}, ${isLight ? 0.03 : 0.04})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 3D Parallax Floating Nodes & Constellation Lines across sections
    const projected = nodes.map((n, idx) => {
      const driftX = Math.sin(timeSec * 0.35 + idx) * 18 * n.z;
      const driftY = ((n.y * height - scrollProgress * height * 0.85 * n.z) % height + height) % height;
      const px = n.x * width + driftX + pointerX * 22 * n.z;
      const py = driftY + pointerY * 16 * n.z;
      return { px, py, z: n.z, r: n.radius, isBrand: n.isBrand };
    });

    ctx.lineWidth = 1;
    for (let i = 0; i < projected.length; i++) {
      const a = projected[i];
      ctx.fillStyle = a.isBrand
        ? `rgba(${brandRgb}, ${isLight ? 0.26 : 0.38})`
        : `rgba(${cobaltRgb}, ${isLight ? 0.22 : 0.32})`;
      ctx.beginPath();
      ctx.arc(a.px, a.py, a.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < projected.length; j++) {
        const b = projected[j];
        const dx = a.px - b.px;
        const dy = a.py - b.py;
        const distSq = dx * dx + dy * dy;
        if (distSq < 19000) {
          const alpha = (1 - distSq / 19000) * (isLight ? 0.08 : 0.12);
          ctx.strokeStyle = `rgba(${brandRgb}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }
    }
  }

  return {
    renderField,
    setTheme: (nextTheme) => {
      theme = nextTheme;
    }
  };
}

/**
 * Initialize and mount the Hero 3D Developer Workstation + Cross-Section Three.js Effects
 */
export function initPortfolioThreeScene() {
  const mountEl = document.getElementById('three-canvas-mount');
  if (!mountEl) return null;

  const isSoftwareGl = detectSoftwareWebGL();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch {
    mountEl.setAttribute('data-three-ready', 'fallback');
    return null;
  }

  const getStageSize = () => ({
    width: Math.max(mountEl.clientWidth || 860, 280),
    height: Math.max(mountEl.clientHeight || 380, 240)
  });
  const initSize = getStageSize();

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;
  renderer.setSize(initSize.width, initSize.height);
  renderer.domElement.className = 'three-webgl-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  mountEl.innerHTML = '';
  mountEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const initialTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  let currentPalette = getThreeSceneThemePalette(initialTheme);
  scene.fog = new THREE.FogExp2(currentPalette.fogColor, currentPalette.fogDensity);

  // Initialize subtle cross-section ambient field across all portfolio sections
  const crossSectionField = initCrossSectionAmbientField(initialTheme);

  // Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRenderTarget.texture;
  pmremGenerator.dispose();

  // Perspective Camera framed on the 3D Developer Workstation
  const camera = new THREE.PerspectiveCamera(
    36,
    initSize.width / initSize.height,
    0.1,
    60
  );
  camera.position.set(0.0, 0.72, 6.1);

  // ── Cinematic Orange & Cool Cobalt Studio Lighting Rig ──
  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090b10, 1.25);
  scene.add(hemiLight);

  // Warm Cinematic Orange Key Light (#FF5500 / #FF7A33)
  const orangeKeyLight = new THREE.DirectionalLight(0xff7833, currentPalette.keyLightIntensity);
  orangeKeyLight.position.set(4.8, 5.6, 4.5);
  scene.add(orangeKeyLight);

  // Cool Cobalt Rim Light
  const cobaltRimLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
  cobaltRimLight.position.set(-5.5, 3.0, -3.8);
  scene.add(cobaltRimLight);

  // Warm Orange Workstation Desk & Screen Glow Light
  const screenGlowLight = new THREE.PointLight(0xff5500, 2.6, 12);
  screenGlowLight.position.set(0, 0.35, 1.45);
  scene.add(screenGlowLight);

  // ── Procedural High-DPI Textures (Zero External 404s) ──
  const codeScreenTex = createLaptopCodeScreenTexture(renderer);
  const keyboardTex = createKeyboardTexture(renderer);
  const floorGridTex = createWorkstationFloorTexture(renderer);

  const techIcons = {};
  RECOGNIZED_TECH_ICONS.forEach((item) => {
    techIcons[item.id] = createTechIconTexture(renderer, item.id);
  });

  // ── Calibrated PBR Materials (Varied roughness >= 0.25 across parts) ──
  const materials = {
    deskMat: new THREE.MeshStandardMaterial({
      color: currentPalette.statorColor,
      roughness: 0.82,
      metalness: 0.16
    }),
    laptopAluminum: new THREE.MeshPhysicalMaterial({
      color: currentPalette.coreMetalColor,
      metalness: 0.88,
      roughness: 0.24,
      clearcoat: isSoftwareGl ? 0 : 0.45,
      clearcoatRoughness: 0.18
    }),
    keyboardSurface: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: keyboardTex,
      emissive: 0xff5500,
      emissiveMap: keyboardTex,
      emissiveIntensity: 0.22,
      roughness: 0.55,
      metalness: 0.25
    }),
    trackpadGlass: new THREE.MeshPhysicalMaterial({
      color: 0x161b26,
      roughness: 0.12,
      metalness: 0.35,
      clearcoat: isSoftwareGl ? 0 : 0.9
    }),
    hingeDarkMetal: new THREE.MeshStandardMaterial({
      color: 0x0b0e14,
      roughness: 0.35,
      metalness: 0.92
    }),
    screenBezel: new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.10,
      metalness: 0.45
    }),
    codeScreen: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: codeScreenTex
    }),
    mugCeramic: new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.32,
      metalness: 0.15
    }),
    badgeHousing: new THREE.MeshStandardMaterial({
      color: 0x181e2c,
      roughness: 0.30,
      metalness: 0.86
    }),
    brandEmissive: new THREE.MeshStandardMaterial({
      color: currentPalette.brandColor,
      emissive: currentPalette.brandColor,
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.55
    }),
    conduitGlow: new THREE.MeshBasicMaterial({
      color: currentPalette.brandColor,
      transparent: true,
      opacity: 0.34
    }),
    particleMat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.78
    }),
    workstationFloor: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: floorGridTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    })
  };

  const workstation = buildDeveloperWorkstation(renderer, materials, {
    codeScreenTex,
    keyboardTex,
    floorGridTex,
    techIcons
  });

  const updateResponsivePlacement = () => {
    const { width, height } = getStageSize();
    const aspect = width / Math.max(height, 1);
    if (width < 560 || aspect < 1.0) {
      workstation.rootGroup.position.set(0.0, 0.24, 0.0);
      workstation.rootGroup.scale.setScalar(Math.min(0.56, Math.max(0.46, aspect * 0.62)));
    } else if (width < 900 || aspect < 1.45) {
      workstation.rootGroup.position.set(0.0, 0.16, 0.0);
      workstation.rootGroup.scale.setScalar(0.78);
    } else {
      workstation.rootGroup.position.set(0.0, 0.14, 0.0);
      workstation.rootGroup.scale.setScalar(0.98);
    }
  };
  updateResponsivePlacement();
  scene.add(workstation.rootGroup);

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  // Interactive & Scroll State
  let activeMode = 'workstation';
  let customExplodeOverride = null;
  let isPaused = false;
  let scrollProgress = 0;
  let activeSectionId = 'hero';
  let pointerX = 0;
  let pointerY = 0;
  let isDragging = false;
  let dragYaw = 0;
  let dragPitch = 0;
  let lastPointerClientX = 0;
  let lastPointerClientY = 0;

  // Damped kinematic state
  let currentExplode = 1.0;
  let currentLidAngle = THREE_SCENE_MODES.workstation.lidAngle;
  let currentGroupRotX = 0.16;
  let currentGroupRotY = 0.0;
  let elapsedSim = 0;
  let lastTimestamp = performance.now();
  let frameId = 0;

  // Track scroll progress & active section for cross-section 3D effects
  const sectionEls = Array.from(document.querySelectorAll('section[id]'));
  function syncScroll() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    const checkY = window.scrollY + window.innerHeight * 0.35;
    for (const sec of sectionEls) {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (checkY >= top && checkY < top + height) {
        activeSectionId = sec.id || 'hero';
        break;
      }
    }
    document.body.setAttribute('data-active-section', activeSectionId);
    mountEl.setAttribute('data-active-section', activeSectionId);
  }
  syncScroll();

  window.addEventListener('scroll', syncScroll, { passive: true });
  mountEl.addEventListener(
    'pointerdown',
    (e) => {
      isDragging = true;
      lastPointerClientX = e.clientX;
      lastPointerClientY = e.clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    'pointerup',
    () => {
      isDragging = false;
    },
    { passive: true }
  );
  window.addEventListener(
    'pointermove',
    (e) => {
      const rect = mountEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointerX = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 2 - 1, -1), 1);
        pointerY = Math.min(Math.max(-((e.clientY - rect.top) / rect.height) * 2 + 1, -1), 1);
      }
      if (isDragging) {
        const dx = e.clientX - lastPointerClientX;
        const dy = e.clientY - lastPointerClientY;
        lastPointerClientX = e.clientX;
        lastPointerClientY = e.clientY;
        dragYaw += dx * 0.008;
        dragPitch = Math.min(Math.max(dragPitch + dy * 0.006, -0.55), 0.55);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    const { width, height } = getStageSize();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    updateResponsivePlacement();
  });

  // Software-WebGL fenceSync frame pacer
  function afterDraw(cb) {
    const gl = renderer.getContext();
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    } else {
      frameId = window.setTimeout(cb, 80);
    }
  }

  function stepScene(now) {
    const rawDt = Math.min(Math.max((now - lastTimestamp) / 1000, 0.001), 0.1);
    lastTimestamp = now;

    const kinematics = computeThreeSceneKinematics({
      mode: activeMode,
      scrollProgress,
      pointerX,
      pointerY
    });

    if (!isPaused) {
      elapsedSim += rawDt * kinematics.orbitSpeed;
    }

    const desiredExplode =
      customExplodeOverride !== null ? customExplodeOverride : kinematics.targetExplode;

    // Smooth exponential damping for workstation rotation, laptop lid angle, and icon orbit spread
    currentExplode = dampScalar(currentExplode, desiredExplode, 5.5, rawDt);
    currentLidAngle = dampScalar(currentLidAngle, kinematics.targetLidAngle, 5.0, rawDt);
    currentGroupRotX = dampScalar(
      currentGroupRotX,
      kinematics.targetGroupRotX + dragPitch,
      5.0,
      rawDt
    );
    currentGroupRotY = dampScalar(
      currentGroupRotY,
      kinematics.targetGroupRotY + dragYaw + Math.sin(elapsedSim * 0.45) * 0.18,
      5.0,
      rawDt
    );

    camera.position.x = dampScalar(camera.position.x, kinematics.targetCamera.x, 4.2, rawDt);
    camera.position.y = dampScalar(camera.position.y, kinematics.targetCamera.y, 4.2, rawDt);
    camera.position.z = dampScalar(camera.position.z, kinematics.targetCamera.z, 4.2, rawDt);
    camera.lookAt(0, 0.05, 0);

    const { parts, particleOrbits } = workstation;

    // Gentle workstation breathing + smooth rotation
    workstation.rootGroup.rotation.x = currentGroupRotX;
    workstation.rootGroup.rotation.y = currentGroupRotY;

    // Hinged Laptop Display Lid angle responds to mode & scroll
    parts.lidPivot.rotation.x = currentLidAngle;

    // Animate the 5 Recognizable Tech Icon Medallions (Python, React, JS, Node.js, MongoDB)
    parts.techBadges.forEach((badge, idx) => {
      const floatY = Math.sin(elapsedSim * 1.65 + badge.phase) * 0.11;
      const floatZ = Math.cos(elapsedSim * 1.25 + badge.phase) * 0.08;
      const spread = currentExplode;

      // Highlight frontend vs backend icons when switching modes
      let modeBoostScale = 1.0;
      if (kinematics.mode === 'frontend' && (badge.id === 'react' || badge.id === 'javascript')) {
        modeBoostScale = 1.18;
      } else if (
        kinematics.mode === 'backend' &&
        (badge.id === 'python' || badge.id === 'nodejs' || badge.id === 'mongodb')
      ) {
        modeBoostScale = 1.18;
      }

      badge.group.position.set(
        badge.basePos.x * spread,
        badge.basePos.y * spread + floatY,
        badge.basePos.z + floatZ
      );
      badge.group.rotation.y = Math.sin(elapsedSim * 0.9 + idx) * 0.32 - currentGroupRotY * 0.55;
      badge.group.rotation.x = Math.cos(elapsedSim * 0.75 + idx) * 0.12;
      badge.group.scale.setScalar(modeBoostScale);
    });

    // Update Orbiting Micro-Particles
    for (let i = 0; i < particleOrbits.length; i++) {
      const orb = particleOrbits[i];
      const angle = orb.theta + elapsedSim * orb.speed;
      const r = orb.radius * (0.9 + currentExplode * 0.12);
      const x = Math.cos(angle) * r;
      const y = orb.yBase + Math.sin(elapsedSim * 1.4 + orb.phase) * 0.12;
      const z = Math.sin(angle) * r;

      _dummyObj.position.set(x, y, z);
      _dummyObj.rotation.set(elapsedSim + orb.phase, angle, 0);
      _dummyObj.scale.setScalar(orb.scale);
      _dummyObj.updateMatrix();
      parts.instancedParticles.setMatrixAt(i, _dummyObj.matrix);
    }
    parts.instancedParticles.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);

    // Update subtle cross-section ambient field across all other sections
    if (crossSectionField) {
      crossSectionField.renderField(scrollProgress, pointerX, pointerY, elapsedSim);
    }
  }

  function tick() {
    stepScene(performance.now());
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  stepScene(performance.now());
  mountEl.setAttribute('data-three-ready', 'true');
  mountEl.setAttribute('data-scene-mode', activeMode);
  if (isSoftwareGl) {
    afterDraw(tick);
  } else {
    frameId = requestAnimationFrame(tick);
  }

  // Public API for UI controls
  function setMode(nextMode) {
    if (!THREE_SCENE_MODES[nextMode]) return activeMode;
    const resolvedPreset = THREE_SCENE_MODES[nextMode];
    activeMode = resolvedPreset.id;
    customExplodeOverride = null;

    const sliderEl = document.getElementById('three-explode-slider');
    if (sliderEl) {
      sliderEl.value = String(resolvedPreset.explodeFactor);
    }
    mountEl.setAttribute('data-scene-mode', activeMode);
    const statusEl = document.getElementById('three-mode-status');
    if (statusEl) {
      statusEl.textContent = resolvedPreset.subtitle;
    }
    document.querySelectorAll('[data-three-mode]').forEach((btn) => {
      const btnMode = btn.getAttribute('data-three-mode');
      const isMatch =
        btnMode === activeMode ||
        (THREE_SCENE_MODES[btnMode] && THREE_SCENE_MODES[btnMode].id === activeMode);
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    return activeMode;
  }

  function setExplode(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return currentExplode;
    customExplodeOverride = Math.min(Math.max(num, 0.8), 1.8);
    return customExplodeOverride;
  }

  function setTheme(themeName) {
    currentPalette = getThreeSceneThemePalette(themeName);
    if (scene.fog) {
      scene.fog.color.setHex(currentPalette.fogColor);
      scene.fog.density = currentPalette.fogDensity;
    }
    materials.laptopAluminum.color.setHex(currentPalette.coreMetalColor);
    materials.deskMat.color.setHex(currentPalette.statorColor);
    materials.brandEmissive.color.setHex(currentPalette.brandColor);
    materials.brandEmissive.emissive.setHex(currentPalette.brandColor);
    materials.conduitGlow.color.setHex(currentPalette.brandColor);
    orangeKeyLight.intensity = currentPalette.keyLightIntensity;
    if (crossSectionField) {
      crossSectionField.setTheme(currentPalette.theme);
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    mountEl.setAttribute('data-scene-paused', isPaused ? 'true' : 'false');
    const pauseBtn = document.getElementById('three-pause-btn');
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
      pauseBtn.textContent = isPaused ? 'Resume 3D' : 'Pause 3D';
    }
    return isPaused;
  }

  function dispose() {
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    workstation.geometries.forEach((g) => g.dispose());
    Object.values(materials).forEach((m) => m.dispose());
    workstation.extraMaterials.forEach((m) => m.dispose());
    codeScreenTex.dispose();
    keyboardTex.dispose();
    floorGridTex.dispose();
    Object.values(techIcons).forEach((t) => t.dispose());
    envRenderTarget.dispose();
    renderer.dispose();
  }

  document.querySelectorAll('[data-three-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-three-mode');
      if (mode) setMode(mode);
    });
  });

  const explodeSlider = document.getElementById('three-explode-slider');
  if (explodeSlider) {
    explodeSlider.addEventListener('input', (e) => {
      setExplode(e.target.value);
    });
  }

  const dockToggleBtn = document.getElementById('three-dock-toggle');
  const dockEl = document.getElementById('three-control-dock');
  if (dockToggleBtn && dockEl) {
    dockToggleBtn.addEventListener('click', () => {
      const isCollapsed = dockEl.classList.toggle('dock-collapsed');
      dockToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      dockToggleBtn.textContent = isCollapsed ? '▴ Show Controls' : '▾ Hide Controls';
    });
  }

  const pauseBtn = document.getElementById('three-pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      togglePause();
    });
  }

  const controller = {
    setMode,
    setExplode,
    setTheme,
    togglePause,
    dispose,
    getState: () => ({
      ready: true,
      isSoftwareGl,
      mode: activeMode,
      activeSection: activeSectionId,
      explode: Number(currentExplode.toFixed(2)),
      lidAngle: Number(currentLidAngle.toFixed(2)),
      isPaused,
      theme: currentPalette.theme,
      techIcons: workstation.parts.techBadges.map((b) => b.name),
      hasLaptopCodeDisplay: true
    })
  };

  window.__portfolioThreeScene = controller;
  return controller;
}
