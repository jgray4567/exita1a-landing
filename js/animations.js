/* ==========================================================================
   A1A.realty — Animations & Interaction Engine
   Scroll-triggered reveals, animated counters, smooth scroll, and ambient FX.
   ========================================================================== */

(function () {
  'use strict';

  /* ── Scroll Reveal (IntersectionObserver) ───────────────────────────── */
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: reveal everything immediately
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  /* ── Animated Counters ──────────────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000; // ms
    const startTime = performance.now();
    const originalText = el.textContent.trim();

    // Detect suffix (e.g. "90+" → "+", "100%" → "%")
    const suffix = originalText.replace(/[\d,]+/, '');

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => animateCounter(el));
  }

  /* ── Smooth Scroll for Anchor Links ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
      const targetPosition =
        targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Update URL hash without jumping
      history.pushState(null, '', targetId);
    });
  });

  /* ── Parallax-lite for Orbs (mouse-follow on desktop) ───────────────── */
  const orbs = document.querySelectorAll('.orb');

  if (orbs.length && window.matchMedia('(min-width: 769px)').matches) {
    let ticking = false;

    document.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 12;
          orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });

        ticking = false;
      });
    });
  }

  /* ── Active Nav Highlight on Scroll ─────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  function highlightNav() {
    const scrollY = window.scrollY;
    const navHeight = document.querySelector('.nav')?.offsetHeight || 0;

    sections.forEach((section) => {
      const top = section.offsetTop - navHeight - 100;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach((link) => {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav(); // Run once on load
})();
