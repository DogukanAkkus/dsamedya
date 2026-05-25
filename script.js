// =============================
// Dsamedya - script.js
// =============================

document.addEventListener('DOMContentLoaded', () => {

  // ── Çerezleri ve depolamayı temizle (her sayfa yüklenişinde) ──
  (function clearAllStorage() {
    try {
      // localStorage temizle
      localStorage.clear();
    } catch(e) { /* güvenlik kısıtlaması durumunda sessizce geç */ }

    try {
      // sessionStorage temizle
      sessionStorage.clear();
    } catch(e) { /* sessizce geç */ }

    try {
      // Kendi domain'imize ait tüm çerezleri sil
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          // Çerezi geçmiş bir tarihe ayarlayarak sil
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + '; SameSite=Lax';
        }
      }
    } catch(e) { /* sessizce geç */ }
  })();

  // ── Mobile Drawer (iOS safe) ──
  const hamburger = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = drawer ? drawer.querySelectorAll('.drawer-links a') : [];
  const drawerContent = drawer ? drawer.querySelector('.drawer-content') : null;

  // iOS body scroll lock state
  let scrollY = 0;

  function lockBodyScroll() {
    scrollY = window.scrollY;
    document.body.classList.add('drawer-open');
    document.body.style.top = `-${scrollY}px`;
  }

  function unlockBodyScroll() {
    document.body.classList.remove('drawer-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  function openDrawer() {
    if (!drawer) return;
    lockBodyScroll();
    drawer.classList.add('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');

    // Prevent body touch scrolling behind drawer
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    unlockBodyScroll();
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

    document.removeEventListener('touchmove', preventTouchMove);
  }

  function preventTouchMove(e) {
    // Only prevent if drawer is open and touch is NOT inside drawer content
    if (!drawer || !drawer.classList.contains('open')) return;
    const target = e.target;
    if (drawerContent && drawerContent.contains(target)) return;
    e.preventDefault();
  }

  if (hamburger) {
    hamburger.addEventListener('click', openDrawer);
    // Prevent ghost clicks on iOS
    hamburger.addEventListener('touchstart', () => {
      // Just for responsiveness - no preventDefault needed
    }, { passive: true });
  }
  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  // Close drawer on link click with smooth scroll support
  drawerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // If it's a page-internal link, close drawer first then smooth scroll
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          closeDrawer();
          // Small delay to let drawer animation finish
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 360);
        }
      } else {
        closeDrawer();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Handle orientation change while drawer is open
  window.addEventListener('orientationchange', () => {
    if (drawer && drawer.classList.contains('open')) {
      // Re-fix scroll position after orientation change
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 100);
    }
  });

  // Handle window resize while drawer is open
  window.addEventListener('resize', () => {
    if (drawer && drawer.classList.contains('open')) {
      // Re-fix scroll position after resize
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 100);
    }
  });

  // ── FAQ Accordion ──
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach((other) => {
        const ob = other.querySelector('.faq-question');
        const oa = other.querySelector('.faq-answer');
        if (ob && oa) {
          ob.setAttribute('aria-expanded', 'false');
          oa.hidden = true;
        }
      });

      // Toggle clicked
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  // ── Sticky nav scroll effect ──
  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        siteNav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
      } else {
        siteNav.style.boxShadow = 'none';
      }
    });
  }

  // ── Smooth scroll for all anchor links (drawer linkleri hariç) ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Drawer içindeki linkleri atla - drawer kendi listener'ını zaten hallediyor
    if (anchor.closest('.mobile-drawer')) return;

    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Stat count-up ----
  const statNumbers = document.querySelectorAll('.stat-number');
  const countedStats = new Set();

  const statCountObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countedStats.has(entry.target)) {
        const el = entry.target;
        const text = el.textContent;
        const hasPercent = text.includes('%');
        const hasPlus = text.includes('+');
        const hasSlash = text.includes('/');

        if (hasSlash) {
          countedStats.add(el);
          statCountObserver.unobserve(el);
          return;
        }

        const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(numericValue)) return;

        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * numericValue);
          el.textContent = (hasPercent ? '%' : '') + current.toLocaleString('tr-TR') + (hasPlus ? '+' : '');
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        countedStats.add(el);
        statCountObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  const sectionStatNumbers = document.querySelectorAll('.stats-section .stat-number');
  sectionStatNumbers.forEach((el) => statCountObserver.observe(el));

  // ---- Animate hero elements on load ----
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 80);
    });
  }

  // ---- Animate cards on scroll ----
  const animateCards = (selector, delayMultiplier = 60) => {
    const cards = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * delayMultiplier}ms`;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(18px)';
      card.style.transition = 'opacity 0.45s ease, transform 0.45s ease, background 0.25s, border-color 0.25s, box-shadow 0.25s';
      observer.observe(card);
    });
  };

  animateCards('.pricing-card', 80);
  animateCards('.faq-item', 50);

  // ---- Animate trust items ----
  const trustItems = document.querySelectorAll('.trust-item');
  trustItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12px)';
    item.style.transition = `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`;
  });

  const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        trustObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  trustItems.forEach(item => trustObserver.observe(item));

  // ---- Animate stat items ----
  const statItems = document.querySelectorAll('.stat-item');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  statItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(16px)';
    item.style.transition = `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`;
    statObserver.observe(item);
  });

});