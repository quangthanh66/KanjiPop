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

    // 1. Twinkling Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = `rgba(${s.tint},${tw.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.cross && tw > 0.72) {
        const len = s.r * 3.8 * tw;
        ctx.strokeStyle = `rgba(${s.tint},${(tw * 0.65).toFixed(3)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y);
        ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len);
        ctx.lineTo(s.x, s.y + len);
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

    rafId = requestAnimationFrame(frame);
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
