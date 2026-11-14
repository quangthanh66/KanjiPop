/* ==========================================================================
   Cosmic Astrolabe VFX Engine (60fps Starfield, Shooting Stars & Stardust)
   ========================================================================== */
(function () {
  let rafId = 0;
  let activeCanvas = null;
  let stars = [];
  let motes = [];
  let shooters = [];
  let lastTime = 0;
  let shooterTimer = 0;

  function initParticles(w, h) {
    const starCount = Math.min(130, Math.max(55, Math.floor((w * h) / 11000)));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.85,
      r: 0.7 + Math.random() * 1.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.8,
      cross: Math.random() < 0.16,
      tint: Math.random() < 0.35 ? '186,230,253' : Math.random() < 0.5 ? '253,230,138' : '255,255,255'
    }));

    const moteCount = Math.min(34, Math.max(16, Math.floor(w / 42)));
    motes = Array.from({ length: moteCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 10,
      vy: -8 - Math.random() * 16,
      r: 1.2 + Math.random() * 2.2,
      alpha: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.55
    }));
    shooters = [];
  }

  function resizeCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      initParticles(w, h);
    }
    return { w, h, dpr };
  }

  function frame(ts) {
    if (!activeCanvas || !activeCanvas.isConnected) {
      rafId = 0;
      return;
    }
    const root = document.getElementById('kanji-pop');
    if (root && root.dataset.view && root.dataset.view !== 'map') {
      rafId = requestAnimationFrame(frame);
      return;
    }

    const dt = lastTime ? Math.min(0.05, (ts - lastTime) / 1000) : 0.016;
    lastTime = ts;

    const ctx = activeCanvas.getContext('2d');
    const { w, h, dpr } = resizeCanvas(activeCanvas);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const t = ts * 0.001;
    const mapScreen = document.getElementById('map-screen');
    const chIdx = Number(mapScreen?.dataset.chapter || 0);
    const targetParallax = (1 - chIdx) * 32;
    if (typeof window._astroSkyPx !== 'number') window._astroSkyPx = targetParallax;
    window._astroSkyPx += (targetParallax - window._astroSkyPx) * (1 - Math.exp(-dt * 4.5));
    const skyDx = window._astroSkyPx;

    // Subtle Sky Constellations (Upper-Left & Upper-Right)
    const constellations = [
      [[0.12, 0.24], [0.18, 0.16], [0.25, 0.21], [0.29, 0.12], [0.35, 0.17]],
      [[0.66, 0.14], [0.72, 0.20], [0.78, 0.13], [0.84, 0.19], [0.79, 0.26]]
    ];
    for (let c = 0; c < constellations.length; c++) {
      const pts = constellations[c];
      const pulse = 0.22 + 0.12 * Math.sin(t * 0.9 + c * 2.1);
      ctx.strokeStyle = `rgba(125, 211, 252, ${pulse.toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const px = pts[i][0] * w + skyDx * 0.65;
        const py = pts[i][1] * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      for (let i = 0; i < pts.length; i++) {
        const px = pts[i][0] * w + skyDx * 0.65;
        const py = pts[i][1] * h;
        ctx.fillStyle = `rgba(253, 230, 138, ${(pulse + 0.35).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 1. Twinkling Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const sx = ((s.x + skyDx * 0.5) % w + w) % w;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = `rgba(${s.tint},${tw.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.cross && tw > 0.72) {
        const len = s.r * 3.8 * tw;
        ctx.strokeStyle = `rgba(${s.tint},${(tw * 0.65).toFixed(3)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(sx - len, s.y);
        ctx.lineTo(sx + len, s.y);
        ctx.moveTo(sx, s.y - len);
        ctx.lineTo(sx, s.y + len);
        ctx.stroke();
      }
    }

    // 2. Floating Stardust Motes
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += m.vx * dt + Math.sin(t * 0.9 + m.phase) * 4 * dt;
      m.y += m.vy * dt;
      if (m.y < -12) {
        m.y = h + 12;
        m.x = Math.random() * w;
      }
      if (m.x < -12) m.x = w + 12;
      if (m.x > w + 12) m.x = -12;

      const glow = m.alpha * (0.6 + 0.4 * Math.sin(t * 2.1 + m.phase));
      ctx.fillStyle = m.gold
        ? `rgba(253, 224, 71, ${glow.toFixed(3)})`
        : `rgba(103, 232, 249, ${glow.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Occasional Shooting Stars
    shooterTimer += dt;
    if (shooterTimer > 4.2 + Math.random() * 3.5) {
      shooterTimer = 0;
      shooters.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h * (0.05 + Math.random() * 0.25),
        vx: -280 - Math.random() * 140,
        vy: 140 + Math.random() * 90,
        life: 0,
        maxLife: 0.75 + Math.random() * 0.35
      });
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.life += dt;
      if (sh.life >= sh.maxLife) {
        shooters.splice(i, 1);
        continue;
      }
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      const p = sh.life / sh.maxLife;
      const alpha = Math.sin(p * Math.PI) * 0.9;
      const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.22, sh.y - sh.vy * 0.22);
      grad.addColorStop(0, `rgba(255, 251, 235, ${alpha.toFixed(3)})`);
      grad.addColorStop(0.4, `rgba(125, 211, 252, ${(alpha * 0.6).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(125, 211, 252, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * 0.22, sh.y - sh.vy * 0.22);
      ctx.stroke();
    }

    drawBlackHoleVortex(t);
    drawEnergyConduits(t);
    rafId = requestAnimationFrame(frame);
  }

  function drawBlackHoleVortex(t) {
    const portals = document.querySelectorAll('#map-screen .astro-blackhole-portal');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vh = window.innerHeight;

    for (let pIdx = 0; pIdx < portals.length; pIdx++) {
      const portal = portals[pIdx];
      const canvas = portal.querySelector('.astro-blackhole-canvas');
      if (!canvas) continue;
      const rect = portal.getBoundingClientRect();
      if (rect.bottom < -30 || rect.top > vh + 30) continue;

      const pw = rect.width;
      const ph = rect.height;
      if (pw < 40 || ph < 40) continue;

      if (canvas.width !== Math.floor(pw * dpr) || canvas.height !== Math.floor(ph * dpr)) {
        canvas.width = Math.floor(pw * dpr);
        canvas.height = Math.floor(ph * dpr);
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, pw, ph);

      const cx = pw * 0.5;
      const cy = ph * 0.5;
      const R = Math.min(pw, ph) * 0.5;
      const rHole = R * 0.625; // Matches the hollow inner cutout of the golden clock ring

      ctx.save();

      // 1. Volumetric Rotating Accretion Disk Glow
      const diskGrad = ctx.createRadialGradient(cx, cy, rHole * 0.28, cx, cy, rHole * 0.98);
      diskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      diskGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.42)');
      diskGrad.addColorStop(0.65, 'rgba(56, 189, 248, 0.34)');
      diskGrad.addColorStop(0.92, 'rgba(251, 191, 36, 0.26)');
      diskGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, rHole * 0.98, 0, Math.PI * 2);
      ctx.fill();

      // 2. Gravitational Lensing & Swirling Accretion Disk (Additive / Screen)
      ctx.globalCompositeOperation = 'screen';

      // Swirling Multi-Arm Plasma Vortex (Continuous 60fps Motion)
      const armCount = 4;
      const spiralSteps = 44;
      const baseRot = t * 0.72;

      // 4 Elemental Cosmic Plasma Colors for the Arms
      const armColors = [
        ['rgba(168, 85, 247, 0.4)', '#c084fc', '#e879f9'],
        ['rgba(2, 132, 199, 0.4)', '#38bdf8', '#7dd3fc'],
        ['rgba(217, 119, 6, 0.4)', '#fbbf24', '#fde047'],
        ['rgba(225, 29, 72, 0.4)', '#f43f5e', '#fb7185']
      ];

      for (let a = 0; a < armCount; a++) {
        const armAngle0 = (a * (Math.PI * 2 / armCount)) + baseRot;
        const colors = armColors[a % armColors.length];

        ctx.beginPath();
        for (let s = 0; s <= spiralSteps; s++) {
          const frac = s / spiralSteps;
          const r = rHole * (0.96 - 0.68 * Math.pow(frac, 1.25));
          const theta = armAngle0 + Math.pow(frac, 1.15) * Math.PI * 1.8;
          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * r;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        const pulse = 0.6 + 0.22 * Math.sin(t * 2.5 + a * 1.57);
        // Outer diffuse nebula wisp
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 24 * pulse;
        ctx.stroke();

        // Core plasma stream
        ctx.strokeStyle = colors[1];
        ctx.lineWidth = 9 * pulse;
        ctx.stroke();

        // White-hot filament
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4 * pulse;
        ctx.stroke();
      }

      // 3. Central Event Horizon Singularity (Pure Void Black Hole)
      ctx.globalCompositeOperation = 'source-over';
      const coreVoid = ctx.createRadialGradient(cx, cy, 0, cx, cy, rHole * 0.32);
      coreVoid.addColorStop(0, '#000000');
      coreVoid.addColorStop(0.85, '#020208');
      coreVoid.addColorStop(1, 'rgba(8, 5, 24, 0.96)');
      ctx.fillStyle = coreVoid;
      ctx.beginPath();
      ctx.arc(cx, cy, rHole * 0.31, 0, Math.PI * 2);
      ctx.fill();

      // 4. Relativistic Photon Ring (Blinding Warp Border Around Singularity)
      ctx.globalCompositeOperation = 'screen';
      const photonR = rHole * 0.31;
      const photonPulse = 0.88 + 0.12 * Math.sin(t * 3.4);
      const ringGrad = ctx.createRadialGradient(cx, cy, photonR * 0.82, cx, cy, photonR * 1.45);
      ringGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      ringGrad.addColorStop(0.38, `rgba(56, 189, 248, ${(0.92 * photonPulse).toFixed(3)})`);
      ringGrad.addColorStop(0.68, `rgba(244, 63, 94, ${(0.72 * photonPulse).toFixed(3)})`);
      ringGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, photonR * 1.45, 0, Math.PI * 2);
      ctx.fillStyle = ringGrad;
      ctx.fill();

      // Sharp central photon orbit line
      ctx.beginPath();
      ctx.arc(cx, cy, photonR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.96 * photonPulse).toFixed(3)})`;
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // 5. Infalling Stardust & Magic Sparks (Gravitational Inward Suction)
      const sparkCount = 56;
      for (let i = 0; i < sparkCount; i++) {
        const speed = 0.16 + (i % 7) * 0.026;
        const phase = (t * speed + i * 0.073) % 1;
        const initAngle = (i * 0.618033) * Math.PI * 2;

        const r = rHole * (0.95 - 0.66 * Math.pow(phase, 1.2));
        const theta = initAngle + baseRot * 1.4 + Math.pow(phase, 1.8) * Math.PI * 3.6;

        const sx = cx + Math.cos(theta) * r;
        const sy = cy + Math.sin(theta) * r;

        const size = (1 - phase * 0.45) * (1.3 + (i % 3) * 1.2);
        const alpha = Math.sin(phase * Math.PI) * 0.88;

        const tailLen = (1 + phase * 2.5) * 4;
        const tailTheta = theta - 0.08 * (1 + phase * 1.5);
        const tx = cx + Math.cos(tailTheta) * (r + tailLen * 0.6);
        const ty = cy + Math.sin(tailTheta) * (r + tailLen * 0.6);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = (i % 2 === 0)
          ? `rgba(56, 189, 248, ${alpha.toFixed(3)})`
          : `rgba(253, 224, 71, ${alpha.toFixed(3)})`;
        ctx.lineWidth = size * 0.85;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.95, 0, Math.PI * 2);
        ctx.fillStyle = (i % 3 === 0)
          ? `rgba(255, 255, 255, ${alpha.toFixed(3)})`
          : (i % 3 === 1)
            ? `rgba(168, 85, 247, ${alpha.toFixed(3)})`
            : `rgba(251, 191, 36, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // 6. Outer Event Horizon Rim Distortion Ring
      ctx.beginPath();
      ctx.arc(cx, cy, rHole * 0.98, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.48)';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, rHole * 0.94, 0, Math.PI * 2);
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -t * 18;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.52)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }

  function drawEnergyConduits(t) {
    const fields = document.querySelectorAll('#map-screen .astro-constellation-field');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vh = window.innerHeight;

    for (let aIdx = 0; aIdx < fields.length; aIdx++) {
      const field = fields[aIdx];
      const canvas = field.querySelector('.astro-energy-canvas');
      if (!canvas) continue;
      const hub = field.querySelector('.astro-dial-hub') || field;
      const hubRect = hub.getBoundingClientRect();
      if (hubRect.bottom < -30 || hubRect.top > vh + 30) continue;

      const aw = hubRect.width;
      const ah = hubRect.height;
      if (aw < 20 || ah < 20) continue;

      if (canvas.width !== Math.floor(aw * dpr) || canvas.height !== Math.floor(ah * dpr)) {
        canvas.width = Math.floor(aw * dpr);
        canvas.height = Math.floor(ah * dpr);
        field._cachedPts = null;
      }

      const sizeKey = Math.round(aw) + 'x' + Math.round(ah);
      let pts = field._cachedPts;
      if (!pts || field._cachedSizeKey !== sizeKey) {
        const nodes = hub.querySelectorAll('.astro-node');
        if (nodes.length < 2) continue;
        pts = [];
        for (let i = 0; i < nodes.length; i++) {
          const ped = nodes[i].querySelector('.astro-pedestal-img') || nodes[i];
          const r = ped.getBoundingClientRect();
          pts.push({
            x: r.left + r.width * 0.5 - hubRect.left,
            y: r.top + r.height * 0.52 - hubRect.top
          });
        }
        field._cachedPts = pts;
        field._cachedSizeKey = sizeKey;
      }
      if (pts.length < 2) continue;

      // Build constellation edges from data-edges (or fallback to linear chain)
      const rawEdges = (field.dataset.edges || '').split(',').map(s => s.trim()).filter(Boolean);
      const edgePairs = [];
      for (let i = 0; i < rawEdges.length; i++) {
        const parts = rawEdges[i].split('-').map(Number);
        if (parts.length === 2 && pts[parts[0]] && pts[parts[1]]) {
          edgePairs.push(parts);
        }
      }
      if (!edgePairs.length) {
        for (let i = 0; i < pts.length - 1; i++) edgePairs.push([i, i + 1]);
      }

      const segs = edgePairs.map(([ia, ib]) => {
        const a = pts[ia], b = pts[ib];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        return { ax: a.x, ay: a.y, bx: b.x, by: b.y, dx, dy, len, nx: -dy / len, ny: dx / len };
      });

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, aw, ah);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 0. Subtle Constellation Orbital Ellipses (Different Orbits per Chapter)
      const chIdx = Number(field.closest('.astro-chapter-section')?.dataset.ch || aIdx);
      const cx = aw * 0.5;
      const cy = ah * 0.48;
      const orbitTilt = (chIdx - 1) * 0.28 + Math.sin(t * 0.15 + chIdx) * 0.03;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orbitTilt);
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -t * 14;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.16)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(0, 0, aw * 0.42, ah * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-orbitTilt * 1.7);
      ctx.lineDashOffset = t * 11;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.14)';
      ctx.beginPath();
      ctx.ellipse(0, 0, aw * 0.30, ah * 0.24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      // 1. Soft Ambient Constellation Conduit Lines (Gold + Cyan Bloom)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < segs.length; i++) {
        ctx.moveTo(segs[i].ax, segs[i].ay);
        ctx.lineTo(segs[i].bx, segs[i].by);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 9;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 3.8;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 2. Multi-Layered Sinusoidal Flowing Energy Ribbons Along Each Constellation Edge
      const ribbonLen = 0.56;
      const steps = 22;
      for (let eIdx = 0; eIdx < segs.length; eIdx++) {
        const s = segs[eIdx];
        const head = ((t * 0.32 + eIdx * 0.37) % 1.45);
        const tail = head - ribbonLen;

        for (let layer = 0; layer < 3; layer++) {
          const left = [];
          const right = [];
          for (let j = 0; j <= steps; j++) {
            const f = j / steps;
            const u = tail + f * ribbonLen;
            if (u < 0 || u > 1) continue;
            const px = s.ax + s.dx * u;
            const py = s.ay + s.dy * u;
            const env = Math.sin(Math.PI * f);
            const w = Math.pow(env, 0.65) * (layer === 0 ? 5.8 : layer === 1 ? 3.0 : 1.35);
            const wave = Math.sin(f * 8 - t * 3.4 + layer * 1.1 + eIdx * 1.7) * (layer === 2 ? 0.8 : 2.3) * env;
            left.push([px + s.nx * (wave + w), py + s.ny * (wave + w)]);
            right.push([px + s.nx * (wave - w), py + s.ny * (wave - w)]);
          }
          if (left.length < 3) continue;

          const pStart = left[0];
          const pEnd = left[left.length - 1];
          const grad = ctx.createLinearGradient(pStart[0], pStart[1], pEnd[0], pEnd[1]);
          if (layer === 0) {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.25)');
            grad.addColorStop(0.85, 'rgba(125, 211, 252, 0.42)');
            grad.addColorStop(1, 'rgba(125, 211, 252, 0)');
          } else if (layer === 1) {
            grad.addColorStop(0, 'rgba(125, 211, 252, 0)');
            grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.50)');
            grad.addColorStop(0.82, 'rgba(253, 230, 138, 0.70)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          } else {
            grad.addColorStop(0, 'rgba(254, 249, 195, 0)');
            grad.addColorStop(0.6, 'rgba(254, 249, 195, 0.85)');
            grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(left[0][0], left[0][1]);
          for (let k = 1; k < left.length; k++) ctx.lineTo(left[k][0], left[k][1]);
          for (let k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
          ctx.closePath();
          ctx.fill();
        }

        if (head >= 0.02 && head <= 1.0) {
          const hx = s.ax + s.dx * head;
          const hy = s.ay + s.dy * head;
          const orbR = 10;
          const orb = ctx.createRadialGradient(hx, hy, 0, hx, hy, orbR);
          orb.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
          orb.addColorStop(0.3, 'rgba(186, 230, 253, 0.55)');
          orb.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = orb;
          ctx.fillRect(hx - orbR, hy - orbR, orbR * 2, orbR * 2);
        }
      }

      // 3. Drifting Micro-Sparks Along Constellation Edges
      const sparkCount = 18;
      for (let i = 0; i < sparkCount; i++) {
        const s = segs[i % segs.length];
        const life = ((t * 0.45 + i * 0.618) % 1 + 1) % 1;
        const u = ((t * 0.16 + i * 0.29) % 1 + 1) % 1;
        const px = s.ax + s.dx * u;
        const py = s.ay + s.dy * u;
        const dir = (i % 2 === 0 ? 1 : -1);
        const drift = dir * (4 + 12 * life);
        const sx = px + s.nx * drift;
        const sy = py + s.ny * drift - life * 5;
        const alpha = Math.sin(Math.PI * life) * 0.85;
        const sr = 1.1 + (i % 3) * 0.55;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(t * 1.6 + i);
        ctx.fillStyle = i % 3 === 0
          ? `rgba(254, 240, 138, ${alpha.toFixed(3)})`
          : `rgba(186, 230, 253, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, -sr * 1.6);
        ctx.lineTo(sr * 0.9, 0);
        ctx.lineTo(0, sr * 1.6);
        ctx.lineTo(-sr * 0.9, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  window.AstroVFX = {
    mount() {
      const canvas = document.querySelector('#map-screen .astro-vfx-canvas');
      if (!canvas) return;
      activeCanvas = canvas;
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(frame);
      }
    }
  };
})();
