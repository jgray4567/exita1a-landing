/* ==========================================================================
   A1A.realty — Navigation Controller
   Mobile menu toggle, scroll-state nav, and keyboard accessibility.
   ========================================================================== */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const mobileToggle = document.getElementById('mobileToggle');

  if (!nav || !navLinks || !mobileToggle) return;

  /* ── Mobile Menu Toggle ─────────────────────────────────────────────── */
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    navLinks.classList.add('active');
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    navLinks.classList.remove('active');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
  }

  mobileToggle.addEventListener('click', toggleMenu);

  // Close menu when a nav link is clicked (mobile)
  navLinks.querySelectorAll('.nav__link, .nav__cta').forEach((link) => {
    link.addEventListener('click', () => {
      if (menuOpen) closeMenu();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Close menu if viewport resizes above mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menuOpen) closeMenu();
  });

  /* ── Scroll-state: Shrink / Backdrop Nav ────────────────────────────── */
  let lastScrollY = 0;
  let ticking = false;

  function updateNavState() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateNavState);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Run once on load (handles refresh mid-page)
  updateNavState();
})();
