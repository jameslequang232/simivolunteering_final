/* =========================================
   SIMI VOLUNTEERING — SHARED SCRIPTS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll Reveal ──────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Mobile nav toggle ─────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const expanded = mobileNav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
      // Animate hamburger → X
      toggle.classList.toggle('is-open', expanded);
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'));
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
      }
    });
  }

  // ── Ripple effect on cards ─────────────────────────────────────
  document.querySelectorAll('.card[data-ripple]').forEach(card => {
    card.addEventListener('pointerdown', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.className = 'ripple';
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
      `;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // ── Smooth active-link highlighting ───────────────────────────
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });

  // ── Counter animation (stats section) ─────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));
  }

  // ── Search / filter (volunteer page) ──────────────────────────
  const searchInput = document.getElementById('volunteer-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const volCards = document.querySelectorAll('.vol-card');

  function updateResultsCount() {
    const countEl = document.getElementById('results-count');
    if (!countEl) return;
    const visible = [...volCards].filter(c => c.style.display !== 'none').length;
    countEl.textContent = `Showing ${visible} opportunit${visible === 1 ? 'y' : 'ies'}`;
  }

  function filterCards() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const active = document.querySelector('.filter-btn.active');
    const category = active ? active.dataset.filter : 'all';

    volCards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const cats = (card.dataset.category || '');
      const matchQ = !q || name.includes(q);
      const matchC = category === 'all' || cats.includes(category);
      card.style.display = matchQ && matchC ? '' : 'none';
    });

    // Show empty state
    const visible = [...volCards].filter(c => c.style.display !== 'none').length;
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = visible === 0 ? 'flex' : 'none';

    updateResultsCount();
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards();
    });
  });

  updateResultsCount();

});

// ── Ripple CSS injected via JS ─────────────────────────────────
(function injectRippleCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .card { position: relative; overflow: hidden; }
    .ripple {
      position: absolute; border-radius: 50%; pointer-events: none;
      background: rgba(66,133,244,.12);
      animation: ripple-anim 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes ripple-anim {
      from { transform: scale(0); opacity: 1; }
      to   { transform: scale(1); opacity: 0; }
    }
    .nav-toggle { display: flex; flex-direction: column; gap: 5px; width: 24px; }
    .nav-toggle span {
      display: block; height: 2px; background: var(--text-secondary);
      border-radius: 2px; transition: all 0.25s ease;
    }
    .nav-toggle.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-toggle.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .nav-toggle.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  `;
  document.head.appendChild(style);
}());
