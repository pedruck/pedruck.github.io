/* Animações das seções (Motion). O hero fica com a entrada própria em CSS.
   Se a biblioteca não carregar ou o usuário preferir menos movimento,
   o conteúdo aparece normalmente. */
import { animate, inView, scroll, stagger } from 'https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm';

const root = document.documentElement;
const ease = [0.19, 1, 0.22, 1];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.__motionReady = true;

if (reduce) {
  root.classList.remove('js-motion');
} else {
  // barra de progresso de leitura
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

  // títulos das seções: palavras sobem uma a uma
  document.querySelectorAll('.section-head h2, .contact-title').forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words
      .map((w) => `<span class="word" aria-hidden="true"><span>${w}</span></span>`)
      .join(' ');
    h.classList.add('is-split');
  });

  const reveal = (section) => {
    const words = section.querySelectorAll('.word > span');
    const items = section.querySelectorAll(
      '.section-note, .about > *, .entry, .legend, .project, .activities, .tool-group, .contact-card > *, .contact-info > :not(.contact-title)'
    );
    if (words.length) {
      animate(words, { y: ['110%', '0%'] }, { duration: 0.9, delay: stagger(0.06), ease });
    }
    if (items.length) {
      animate(
        items,
        { opacity: [0, 1], y: [28, 0], filter: ['blur(6px)', 'blur(0px)'] },
        { duration: 0.8, delay: stagger(0.07, { startDelay: 0.15 }), ease }
      );
    }
    // linhas internas entram em cascata depois do cartão
    section.querySelectorAll('.activity, .tool-list li').forEach((row, i) => {
      animate(row, { opacity: [0, 1], x: [-10, 0] }, { duration: 0.6, delay: 0.35 + Math.min(i, 14) * 0.04, ease });
    });
  };

  document.querySelectorAll('main .section').forEach((section) => {
    inView(section, () => reveal(section), { amount: 0.12 });
  });

  root.classList.add('motion-armed');

  // projeto aberto: conteúdo entra em cascata
  document.querySelectorAll('.project').forEach((project) => {
    project.addEventListener('toggle', () => {
      if (!project.open) return;
      const parts = project.querySelectorAll('.project-body > *, .project-body .tags li');
      animate(parts, { opacity: [0, 1], y: [12, 0] }, { duration: 0.55, delay: stagger(0.025, { startDelay: 0.08 }), ease });
    });
  });

  // botão copiar: pequeno pulo ao confirmar
  const copyBtn = document.getElementById('copy-mail');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      animate(copyBtn, { scale: [1, 0.92, 1.04, 1] }, { duration: 0.45, ease: 'easeOut' });
    });
  }
}

// indicador deslizante dos assuntos do contato (funciona com ou sem movimento)
const topics = document.querySelector('.topics');
if (topics) {
  const indicator = document.createElement('span');
  indicator.className = 'topic-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  const list = topics.querySelector('.topic-list') || topics;
  list.prepend(indicator);

  let first = true;
  const place = () => {
    const checked = topics.querySelector('input:checked + span');
    if (!checked) return;
    // medidas de layout (offset*) não sofrem com as animações de entrada
    const label = checked.parentElement;
    const to = { x: label.offsetLeft, y: label.offsetTop, width: checked.offsetWidth, height: checked.offsetHeight };
    if (first || reduce) {
      animate(indicator, to, { duration: 0 });
      first = false;
      return;
    }
    animate(indicator, { x: to.x, y: to.y, width: to.width, height: to.height }, { type: 'spring', stiffness: 420, damping: 32 });
  };
  topics.addEventListener('change', place);
  window.addEventListener('resize', () => { first = true; place(); });
  if (document.fonts?.ready) document.fonts.ready.then(place); else place();
}

// brilho na borda dos cartões seguindo o ponteiro
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
