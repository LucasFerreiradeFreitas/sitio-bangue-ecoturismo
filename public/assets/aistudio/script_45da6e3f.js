/* =========================================================
   Sítio Banguê — Interações
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  /* ---------- Vídeo do Hero (Performance e Acessibilidade) ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const save = navigator.connection && navigator.connection.saveData;
    if (prefersReducedMotion || save) {
      heroVideo.remove();
    }
  }

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header sticky/fixed com estado ---------- */
  const header = document.querySelector('.site-header');
  const setHeaderHeight = () => {
    if (header) {
      document.documentElement.style.setProperty(
        '--header-h',
        header.offsetHeight + 'px',
      );
    }
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', (e) => {
      // Impede o salto da página e garante que o clique não dispare âncoras por acidente
      e.preventDefault();
      e.stopPropagation();

      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Fecha o menu ao redimensionar para desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------- Animações de entrada (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Galeria com lightbox ---------- */
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  let lastFocused = null;

  const openLightbox = (src, alt) => {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lightboxClose && lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg && (lightboxImg.src = '');
      document.body.style.overflow = '';
      lastFocused && lastFocused.focus();
    }, 220);
  };

  if (gallery && lightbox) {
    gallery.querySelectorAll('.g-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        const innerImg = btn.querySelector('img');
        const alt = innerImg ? innerImg.getAttribute('alt') : '';
        if (src) openLightbox(src, alt);
      });
    });

    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---------- Fechamento suave do menu ao clicar em âncoras ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      // Previne que a lógica de âncora afete o botão do menu hamburger
      if (anchor.closest('.menu-toggle')) return;

      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerOffset = header ? header.offsetHeight - 4 : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      history.pushState(null, '', targetId);
    });
  });
})();
