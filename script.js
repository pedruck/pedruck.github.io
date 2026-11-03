(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ano no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // nav ganha fundo depois que o topo sai da tela
  const nav = document.getElementById('nav');
  const sentinel = document.getElementById('top-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => nav.classList.toggle('is-scrolled', !entry.isIntersecting),
      { rootMargin: '80px 0px 0px 0px' }
    ).observe(sentinel);
  }

  // menu mobile
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      links.classList.toggle('is-open', open);
      if (open) nav.classList.add('is-scrolled');
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // tema claro/escuro (escuro é o padrão; o script no <head> aplica a escolha salva)
  const themeToggle = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncTheme = () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Ativar tema escuro' : 'Ativar tema claro');
    }
    if (themeMeta) themeMeta.setAttribute('content', isLight ? '#ffffff' : '#000000');
  };
  syncTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const goingLight = root.getAttribute('data-theme') !== 'light';
      root.classList.add('theme-transition');
      root.setAttribute('data-theme', goingLight ? 'light' : 'dark');
      try { localStorage.setItem('theme', goingLight ? 'light' : 'dark'); } catch (e) {}
      syncTheme();
      window.setTimeout(() => root.classList.remove('theme-transition'), 350);
    });
  }

  // link da seção atual na nav
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if ('IntersectionObserver' in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.classList.remove('is-active'));
          const link = byId.get(entry.target.id);
          if (link) link.classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
  }

  // contato: copiar email
  const copyBtn = document.getElementById('copy-mail');
  const copyStatus = document.getElementById('copy-status');
  if (copyBtn) {
    let resetTimer;
    copyBtn.addEventListener('click', async () => {
      const mail = copyBtn.dataset.mail;
      let ok = false;
      try { await navigator.clipboard.writeText(mail); ok = true; } catch (e) {}
      copyBtn.textContent = ok ? 'Copiado' : 'Copiar';
      if (copyStatus) copyStatus.textContent = ok ? 'Email copiado para a área de transferência.' : 'Não deu para copiar. Selecione o endereço e copie manualmente.';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyBtn.textContent = 'Copiar';
        if (copyStatus) copyStatus.textContent = '';
      }, 2400);
    });
  }

  // contato: monta o email com assunto e mensagem e abre o app de email
  const composer = document.getElementById('composer');
  if (composer) {
    composer.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(composer);
      const topic = data.get('topic') || 'Contato';
      const name = String(data.get('name') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = name ? `${topic}: contato de ${name}` : `${topic}: contato pelo portfólio`;
      const body = [`Olá, Pedro.`, '', message, '', name ? name : ''].join('\n').replace(/\n{3,}/g, '\n\n').trim();
      window.location.href = `mailto:pedrodmreis@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* -----------------------------------------------------------------------
     Constelação do hero: pequenos triângulos distribuídos numa nuvem
     orgânica, girando devagar em 3D. Pausa fora da tela e com a aba oculta;
     com movimento reduzido, desenha um único quadro parado.
     ----------------------------------------------------------------------- */
  const canvas = document.getElementById('constellation');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  const COUNT = window.innerWidth < 700 ? 340 : 620;
  const palette = [
    { w: 0.72, c: 'fg' },
    { w: 0.17, c: '#8052ff' },
    { w: 0.07, c: '#ffb829' },
    { w: 0.04, c: '#15846e' },
  ];
  const pickColor = (r) => {
    let acc = 0;
    for (const p of palette) { acc += p.w; if (r <= acc) return p.c; }
    return 'fg';
  };

  // ruído barato e determinístico
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // pontos numa esfera deformada por lóbulos, formando uma massa orgânica
  const points = [];
  for (let i = 0; i < COUNT; i++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    let x = s * Math.cos(t);
    let y = u;
    let z = s * Math.sin(t);
    const lobes =
      1 +
      0.22 * Math.sin(3 * x + 1.3) * Math.cos(2 * y) +
      0.16 * Math.sin(4 * z + 0.4) +
      0.1 * Math.cos(5 * y - 2 * x);
    // três quartos na casca, para a forma ficar legível; o resto preenche o volume
    const depth = rand() < 0.75 ? 0.9 + 0.1 * rand() : 0.35 + 0.55 * Math.cbrt(rand());
    const r = lobes * depth;
    points.push({
      x: x * r * 1.12,
      y: y * r * 0.88,
      z: z * r,
      size: 1.4 + rand() * 2.6,
      spin: rand() * Math.PI * 2,
      color: pickColor(rand()),
    });
  }

  let fg = '#ffffff';
  const readColors = () => {
    fg = getComputedStyle(root).getPropertyValue('--fg').trim() || '#ffffff';
  };
  readColors();
  new MutationObserver(() => { readColors(); if (!running) draw(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let angle = 0.6;
  let tiltX = 0;
  let tiltTarget = 0;
  let yawOffset = 0;
  let yawTarget = 0;

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.36;
    const cosY = Math.cos(angle + yawOffset);
    const sinY = Math.sin(angle + yawOffset);
    const ax = -0.32 + tiltX;
    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);

    for (const p of points) {
      // rotação em Y, depois em X
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const persp = 2.8 / (2.8 + z2);
      const sx = cx + x1 * scale * persp;
      const sy = cy + y2 * scale * persp;
      const near = (1.4 - z2) / 2.8; // 0 = fundo, 1 = frente
      const alpha = Math.max(0.08, Math.min(1, 0.15 + near * 0.95));
      const size = p.size * persp;
      const rot = p.spin + angle * 1.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color === 'fg' ? fg : p.color;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(rot) * size, sy + Math.sin(rot) * size);
      ctx.lineTo(sx + Math.cos(rot + 2.094) * size, sy + Math.sin(rot + 2.094) * size);
      ctx.lineTo(sx + Math.cos(rot + 4.189) * size, sy + Math.sin(rot + 4.189) * size);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  let running = false;
  let visible = true;
  let last = 0;
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(64, now - (last || now));
    last = now;
    angle += dt * 0.00011;
    tiltX += (tiltTarget - tiltX) * 0.04;
    yawOffset += (yawTarget - yawOffset) * 0.04;
    draw();
    requestAnimationFrame(frame);
  };
  const start = () => {
    if (running || reduceMotion.matches || !visible || document.hidden) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  };
  const stop = () => { running = false; };

  resize();
  draw();
  start();

  window.addEventListener('resize', () => { resize(); draw(); }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener?.('change', () => (reduceMotion.matches ? stop() : start()));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
  }

  // leve inclinação seguindo o ponteiro
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      tiltTarget = ((e.clientY / window.innerHeight) - 0.5) * 0.35;
      yawTarget = ((e.clientX / window.innerWidth) - 0.5) * 0.45;
    },
    { passive: true }
  );
})();
