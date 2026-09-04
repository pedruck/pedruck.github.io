(() => {
  const canvas = document.getElementById('ascii-bg');
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext('2d');
  const CHARS = '01{}[]<>/\\+=*#_.:;$%&'.split('');
  const FONT_SIZE = 11;
  const PROXIMITY_RADIUS = 130;
  const AREA_PER_PARTICLE = 30000;
  const MIN_PARTICLES = 18;
  const MAX_PARTICLES = 110;

  const THEME = {
    dark: { rgb: '236, 233, 228', peak: 0.16, proximity: 0.3 },
    light: { rgb: '23, 23, 26', peak: 0.06, proximity: 0.14 },
  };

  function randomChar() {
    return CHARS[(Math.random() * CHARS.length) | 0];
  }

  let width = 0;
  let height = 0;
  let particles = [];
  let mouseX = -9999;
  let mouseY = -9999;
  let running = true;
  let lastTime = performance.now();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function makeParticle() {
    const duration = 2.5 + Math.random() * 4.5;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      char: randomChar(),
      age: Math.random() * duration,
      duration,
    };
  }

  function targetCount() {
    const n = (width * height) / AREA_PER_PARTICLE;
    return Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round(n)));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = targetCount();
    particles = Array.from({ length: count }, makeParticle);
  }

  function onPointerMove(x, y) {
    mouseX = x;
    mouseY = y;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('mouseleave', () => onPointerMove(-9999, -9999), { passive: true });
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    lastTime = performance.now();
  });

  resize();

  function envelope(p) {
    const t = p.age / p.duration;
    if (t < 0.2) return t / 0.2;
    if (t > 0.75) return Math.max(0, (1 - t) / 0.25);
    return 1;
  }

  function draw(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (running) {
      ctx.clearRect(0, 0, width, height);
      const theme = isLightTheme() ? THEME.light : THEME.dark;
      ctx.font = `${FONT_SIZE}px 'Press Start 2P', 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';

      for (const p of particles) {
        p.age += dt;
        if (p.age >= p.duration) {
          Object.assign(p, makeParticle(), { age: 0 });
        }

        const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
        const proximity = Math.max(0, 1 - dist / PROXIMITY_RADIUS);
        const alpha = theme.peak * envelope(p) + proximity * theme.proximity;

        ctx.fillStyle = `rgba(${theme.rgb}, ${alpha})`;
        ctx.fillText(p.char, p.x, p.y);
      }
    }
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
