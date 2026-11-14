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

    // 0. Subtle Sky Constellations (Upper-Left & Upper-Right)
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

    drawEnergyConduits(t);
    rafId = requestAnimationFrame(frame);
  }

  function drawEnergyConduits(t) {
    const arenas = document.querySelectorAll('#map-screen .astro-orbit-arena');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (let aIdx = 0; aIdx < arenas.length; aIdx++) {
      const arena = arenas[aIdx];
      const canvas = arena.querySelector('.astro-energy-canvas');
      if (!canvas) continue;
      const arenaRect = arena.getBoundingClientRect();
      const aw = arenaRect.width;
      const ah = arenaRect.height;
      if (aw < 20 || ah < 20) continue;

      if (canvas.width !== Math.floor(aw * dpr) || canvas.height !== Math.floor(ah * dpr)) {
        canvas.width = Math.floor(aw * dpr);
        canvas.height = Math.floor(ah * dpr);
      }

      const nodes = arena.querySelectorAll('.astro-node');
      if (nodes.length < 2) continue;

      const pts = [];
      for (let i = 0; i < nodes.length; i++) {
        const ped = nodes[i].querySelector('.astro-pedestal-img') || nodes[i];
        const r = ped.getBoundingClientRect();
        pts.push({
          x: r.left + r.width * 0.5 - arenaRect.left,
          y: r.top + r.height * 0.52 - arenaRect.top
        });
      }

      // Compute cumulative arc length for smooth u in [0, 1] sampling
      const segs = [];
      let totalLen = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        const len = Math.hypot(dx, dy) || 1;
        segs.push({
          ax: pts[i].x, ay: pts[i].y,
          bx: pts[i + 1].x, by: pts[i + 1].y,
          dx, dy, len,
          nx: -dy / len, ny: dx / len,
          start: totalLen, end: totalLen + len
        });
        totalLen += len;
      }
      if (totalLen < 1) continue;

      function samplePath(u) {
        const clamped = Math.max(0, Math.min(1, u));
        const d = clamped * totalLen;
        for (let i = 0; i < segs.length; i++) {
          const s = segs[i];
          if (d <= s.end || i === segs.length - 1) {
            const f = Math.max(0, Math.min(1, (d - s.start) / s.len));
            return {
              x: s.ax + s.dx * f,
              y: s.ay + s.dy * f,
              nx: s.nx,
              ny: s.ny
            };
          }
        }
        const lastS = segs[segs.length - 1];
        return { x: lastS.bx, y: lastS.by, nx: lastS.nx, ny: lastS.ny };
      }

      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, aw, ah);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 1. Soft Ambient Base Conduit (Gold + Cyan Bloom)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.24)';
      ctx.lineWidth = 3.2;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2. Multi-Layered Sinusoidal Flowing Energy Ribbons (Target-VFX style)
      const streamCount = 3;
      const ribbonLen = 0.28;
      const steps = 36;
      for (let sIdx = 0; sIdx < streamCount; sIdx++) {
        const head = ((t * 0.14 + sIdx / streamCount) % 1 + 1) % 1;
        const tail = head - ribbonLen;

        for (let layer = 0; layer < 3; layer++) {
          const left = [];
          const right = [];
          for (let j = 0; j <= steps; j++) {
            const f = j / steps;
            const u = tail + f * ribbonLen;
            if (u < 0 || u > 1) continue;
            const p = samplePath(u);
            const env = Math.sin(Math.PI * f);
            const w = Math.pow(env, 0.65) * (layer === 0 ? 6.2 : layer === 1 ? 3.2 : 1.45);
            const wave = Math.sin(f * 10 - t * 3.2 + layer * 1.1 + sIdx * 2.0) * (layer === 2 ? 0.9 : 2.6) * env;
            left.push([p.x + p.nx * (wave + w), p.y + p.ny * (wave + w)]);
            right.push([p.x + p.nx * (wave - w), p.y + p.ny * (wave - w)]);
          }
          if (left.length < 3) continue;

          const pStart = left[0];
          const pEnd = left[left.length - 1];
          const grad = ctx.createLinearGradient(pStart[0], pStart[1], pEnd[0], pEnd[1]);
          if (layer === 0) {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.26)');
            grad.addColorStop(0.85, 'rgba(125, 211, 252, 0.42)');
            grad.addColorStop(1, 'rgba(125, 211, 252, 0)');
          } else if (layer === 1) {
            grad.addColorStop(0, 'rgba(125, 211, 252, 0)');
            grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.52)');
            grad.addColorStop(0.82, 'rgba(253, 230, 138, 0.72)');
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

        // Luminous Head Orb
        const hPos = samplePath(Math.max(0, Math.min(1, head - 0.015)));
        const orbR = 11;
        const orb = ctx.createRadialGradient(hPos.x, hPos.y, 0, hPos.x, hPos.y, orbR);
        orb.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        orb.addColorStop(0.3, 'rgba(186, 230, 253, 0.55)');
        orb.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = orb;
        ctx.fillRect(hPos.x - orbR, hPos.y - orbR, orbR * 2, orbR * 2);
      }

      // 3. Drifting Micro-Sparks Along Energy Stream
      const sparkCount = 16;
      for (let i = 0; i < sparkCount; i++) {
        const life = ((t * 0.45 + i * 0.618) % 1 + 1) % 1;
        const u = ((t * 0.08 + i / sparkCount) % 1 + 1) % 1;
        const p = samplePath(u);
        const dir = (i % 2 === 0 ? 1 : -1);
        const drift = dir * (4 + 12 * life);
        const sx = p.x + p.nx * drift;
        const sy = p.y + p.ny * drift - life * 5;
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
