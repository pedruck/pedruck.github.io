(() => {
  // ano dinâmico no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // nav: fundo sólido após sair do topo (via IntersectionObserver, sem scroll listener)
  const nav = document.getElementById('nav');
  const sentinel = document.getElementById('top-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => nav.classList.toggle('is-scrolled', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  }

  // nav mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      })
    );
  }

  // toggle de tema claro/escuro (escuro é o padrão, ver script inline no <head>)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const root = document.documentElement;
    const syncThemeToggleA11y = () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    };
    syncThemeToggleA11y();

    themeToggle.addEventListener('click', () => {
      const goingLight = root.getAttribute('data-theme') !== 'light';
      root.classList.add('theme-transition');
      root.setAttribute('data-theme', goingLight ? 'light' : 'dark');
      try {
        localStorage.setItem('theme', goingLight ? 'light' : 'dark');
      } catch (e) {}
      syncThemeToggleA11y();
      window.setTimeout(() => root.classList.remove('theme-transition'), 300);
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionReady = !reduceMotion && window.gsap && window.ScrollTrigger;

  if (!motionReady) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------
     1. Intro da hero — timeline única, sequenciada com position params
     --------------------------------------------------------------------- */
  gsap
    .timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })
    .from('.hero-num', { opacity: 0, y: 10 }, 0)
    .from('.eyebrow', { opacity: 0, y: 14 }, 0.12)
    .from('.hero-name', { opacity: 0, y: 28 }, '-=0.35')
    .from('.hero-role', { opacity: 0, y: 16 }, '-=0.5')
    .from('.hero-tagline', { opacity: 0, y: 16 }, '-=0.55')
    .from('.hero-ctas .btn', { opacity: 0, y: 14, stagger: 0.08 }, '-=0.5')
    .from('.stat', { opacity: 0, y: 14, stagger: 0.08 }, '-=0.4')
    .from('.hero-bottom', { opacity: 0, y: 10 }, '-=0.3');

  /* ---------------------------------------------------------------------
     2. Cabeçalho de cada seção — número, título e legenda em sequência,
        disparado ao entrar na viewport (repete a cada seção rolada)
     --------------------------------------------------------------------- */
  document.querySelectorAll('.section-head').forEach((head) => {
    gsap.timeline({
      defaults: { ease: 'power2.out', duration: 0.6 },
      scrollTrigger: { trigger: head, start: 'top 85%' },
    })
      .from(head.querySelector('.section-num'), { opacity: 0, x: -18 }, 0)
      .from(head.querySelector('h2'), { opacity: 0, y: 20 }, '-=0.4')
      .from(head.querySelector('.section-legend'), { opacity: 0, y: 14 }, '-=0.4');
  });

  /* ---------------------------------------------------------------------
     3. Blocos simples (um único elemento, sem filhos para escalonar)
     --------------------------------------------------------------------- */
  ['.about-bio', '.job-card', '.deepen-title', '.contact-invite'].forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
  });

  /* ---------------------------------------------------------------------
     4. Grupos com filhos escalonados (stagger) — cada cartão/tag entra
        em cascata conforme a seção aparece, e o efeito se repete em
        cada subseção percorrida durante a rolagem, não só no topo
     --------------------------------------------------------------------- */
  const staggerBlocks = [
    { parent: '.facts', items: '.fact', y: 14, x: 0, stagger: 0.1 },
    { parent: '.deepen', items: '.tag', y: 10, x: 0, stagger: 0.035 },
    { parent: '.project-grid', items: '.project-card', y: 28, x: 0, stagger: 0.12 },
    { parent: '.event-grid', items: '.event-card', y: 28, x: 0, stagger: 0.14 },
    { parent: '.contact-links', items: '.contact-link', y: 14, x: 0, stagger: 0.1 },
  ];
  staggerBlocks.forEach(({ parent, items, y, stagger }) => {
    document.querySelectorAll(parent).forEach((parentEl) => {
      const children = parentEl.querySelectorAll(items);
      if (!children.length) return;
      gsap.from(children, {
        opacity: 0,
        y,
        duration: 0.6,
        ease: 'power2.out',
        stagger,
        scrollTrigger: { trigger: parentEl, start: 'top 85%' },
      });
    });
  });

  // grupos de ferramentas: título do grupo entra, depois as tags em cascata
  document.querySelectorAll('.tool-group').forEach((group) => {
    gsap
      .timeline({ scrollTrigger: { trigger: group, start: 'top 88%' } })
      .from(group.querySelector('.tool-group-title'), {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: 'power2.out',
      })
      .from(
        group.querySelectorAll('.tag'),
        { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out', stagger: 0.035 },
        '-=0.25'
      );
  });

  // título de cada subseção de Experiência (Profissional / Projetos / Eventos)
  gsap.utils.toArray('.subsection-title').forEach((title) => {
    gsap.from(title, {
      opacity: 0,
      x: -14,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: title, start: 'top 90%' },
    });
  });

  /* ---------------------------------------------------------------------
     5. Interações contínuas — acompanham a rolagem inteira, não só a
        entrada de cada seção
     --------------------------------------------------------------------- */

  // barra de progresso de leitura no topo
  gsap.to('.scroll-progress-bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });

  // leve paralaxe nos números de seção (01, 02, 03, 04) enquanto a seção passa
  document.querySelectorAll('.section-num').forEach((num) => {
    gsap.to(num, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: num.closest('.section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // nav: destaca o link da seção atual conforme o usuário rola
  const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');
  document.querySelectorAll('main section[id]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return;
        navLinkEls.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === `#${section.id}`)
        );
      },
    });
  });
})();
