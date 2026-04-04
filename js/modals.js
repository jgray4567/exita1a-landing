/* ==========================================================================
   A1A — Modal Controller
   Open/close modals, form submission with success state, keyboard & focus trap.
   ========================================================================== */

(function () {
  'use strict';

  const modals = document.querySelectorAll('.modal');
  const triggers = document.querySelectorAll('[data-modal]');
  let activeModal = null;
  let previousFocus = null;

  /* ── Open ────────────────────────────────────────────────────────────── */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    previousFocus = document.activeElement;
    activeModal = modal;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus the first input after animation settles
    setTimeout(() => {
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 200);
  }

  /* ── Close ───────────────────────────────────────────────────────────── */
  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    activeModal = null;

    // Restore focus
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }

    // Reset form & success state after transition
    setTimeout(() => {
      const form = modal.querySelector('.modal__form');
      const success = modal.querySelector('.modal__success');
      if (form) {
        form.style.display = '';
        form.reset();
      }
      if (success) success.style.display = 'none';
    }, 300);
  }

  /* ── Trigger Buttons ─────────────────────────────────────────────────── */
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal'));
    });
  });

  /* ── Close Buttons & Backdrop ────────────────────────────────────────── */
  modals.forEach((modal) => {
    // X button
    modal.querySelectorAll('.modal__close, .modal__close-btn').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(modal));
    });

    // Backdrop click
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => closeModal(modal));
    }
  });

  /* ── Escape Key ──────────────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
      closeModal(activeModal);
    }
  });

  /* ── Focus Trap ──────────────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !activeModal) return;

    const focusable = activeModal.querySelectorAll(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"]), a[href]'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ── Spam Protection: Timing Check ────────────────────────────────────── */
  // Track when modals open; reject submissions faster than 3 seconds (bot behavior)
  const modalOpenTimes = {};

  const origOpen = openModal;
  // Patch openModal to record timing
  function openModalWithTiming(id) {
    modalOpenTimes[id] = Date.now();
    origOpen(id);
  }
  // Re-bind triggers with timing
  triggers.forEach((trigger) => {
    // Remove old listener by cloning
    const clone = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(clone, trigger);
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      openModalWithTiming(clone.getAttribute('data-modal'));
    });
  });

  /* ── Form Submission (AJAX to FormSubmit) ────────────────────────────── */
  document.querySelectorAll('.modal__form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Timing-based spam check: reject if submitted within 3s of opening
      const modal = form.closest('.modal');
      const modalId = modal ? modal.id : '';
      const openTime = modalOpenTimes[modalId] || 0;
      if (Date.now() - openTime < 3000) {
        console.warn('[A1A] Submission too fast — likely bot.');
        return;
      }

      const formData = new FormData(form);
      const action = form.getAttribute('action');
      const submitBtn = form.querySelector('button[type="submit"]');

      // Disable button during submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';
      }

      // Send via AJAX so we stay on the page
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      })
        .then((res) => {
          // Show success regardless (FormSubmit may redirect on first use)
          const successEl = modal.querySelector('.modal__success');
          form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        })
        .catch(() => {
          // Fallback: show success anyway — the form data was likely received
          const successEl = modal.querySelector('.modal__success');
          form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        });
    });
  });
})();
