// ============================================
// RAKIB PORTFOLIO - Main JavaScript
// Organized: js/script.js
// ============================================

// Preserve scroll position specifically across page reloads.
const RELOAD_SCROLL_KEY = 'portfolio-scroll-y';
window.addEventListener('beforeunload', function() {
  try {
    sessionStorage.setItem(RELOAD_SCROLL_KEY, String(window.scrollY || 0));
  } catch (e) {}
});

window.addEventListener('pageshow', function() {
  try {
    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries && navEntries.length ? navEntries[0].type : '';
    const isReload = navType === 'reload' || (performance.navigation && performance.navigation.type === 1);
    if (!isReload) return;

    const savedY = parseInt(sessionStorage.getItem(RELOAD_SCROLL_KEY) || '0', 10);
    if (!Number.isFinite(savedY) || savedY <= 0) return;

    window.requestAnimationFrame(function() {
      window.scrollTo(0, savedY);
    });
  } catch (e) {}
});

// Dark/Light mode toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  if(document.documentElement.classList.contains('light')) {
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
  themeToggle.addEventListener('click', function() {
    document.documentElement.classList.toggle('light');
    if(document.documentElement.classList.contains('light')) {
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    } else {
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    }
  });
}
// Navbar active state on scroll
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  const hashNavLinks = Array.from(navLinks).filter(function(link) {
    const href = link.getAttribute('href') || '';
    return href.charAt(0) === '#';
  });
  const nav = document.querySelector('.navbar');
  const navToggle = document.getElementById('navToggle');

  function closeMobileMenu() {
    if (!nav || !navToggle) return;
    nav.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navLinks.forEach(function(link) {
      link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 900) {
        closeMobileMenu();
      }
    });
  }

  function onScroll() {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;
    sections.forEach(section => {
      if (section.offsetTop - 80 <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
        hashNavLinks.forEach(link => {
          link.classList.remove('active');
          if ((link.getAttribute('href') || '').substring(1) === section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  let navTicking = false;
  function requestNavUpdate() {
    if (navTicking) return;
    navTicking = true;
    window.requestAnimationFrame(function() {
      onScroll();
      navTicking = false;
    });
  }

  window.addEventListener('scroll', requestNavUpdate, { passive: true });
  onScroll();
});
// Profile image slider with fade animation
document.addEventListener('DOMContentLoaded', function() {
  const profileImages = [
    'rakib.jpg',
    'rakib2.jpg',
    'rakib3.jpg',
    'rakib4.jpg'
  ];
  let currentProfile = 0;
  const profileSlider = document.getElementById('profileSlider');
  if (profileSlider) {
    let isAnimating = false;
    setInterval(() => {
      if (isAnimating) return;
      isAnimating = true;
      profileSlider.classList.add('profile-slider-slide');
      setTimeout(() => {
        currentProfile = (currentProfile + 1) % profileImages.length;
        profileSlider.src = profileImages[currentProfile];
        setTimeout(() => {
          profileSlider.classList.remove('profile-slider-slide');
          isAnimating = false;
        }, 500);
      }, 430);
    }, 3500);
  }

  const fadeEls = document.querySelectorAll('.fade-in');
  const revealEls = document.querySelectorAll('.reveal');

  // Use observer instead of continuous scroll listeners for stable fast-scroll behavior.
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('fade-in')) {
          el.style.animationPlayState = 'running';
        }
        if (el.classList.contains('reveal')) {
          el.classList.add('revealed');
        }
        observer.unobserve(el);
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    });

    fadeEls.forEach(function(el) { revealObserver.observe(el); });
    revealEls.forEach(function(el) { revealObserver.observe(el); });
  } else {
    // Fallback for very old browsers.
    fadeEls.forEach(function(el) { el.style.animationPlayState = 'running'; });
    revealEls.forEach(function(el) { el.classList.add('revealed'); });
  }
});
// Smooth scroll for navigation
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    // Only handle in-page anchors; ignore non-anchor links.
    if (!href || href.charAt(0) !== '#') {
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    contactSuccess.classList.add('visible');
    contactForm.style.display = 'none';
    setTimeout(function() {
      contactSuccess.classList.remove('visible');
      contactForm.style.display = '';
      contactForm.reset();
    }, 3500);
  });
}

// Project card Read More expand/collapse
const projectReadMoreButtons = document.querySelectorAll('.project-read-more');
projectReadMoreButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const targetId = button.getAttribute('aria-controls');
    if (!targetId) return;

    const panel = document.getElementById(targetId);
    if (!panel) return;

    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isExpanded));
    button.textContent = isExpanded ? 'Read More' : 'Read Less';

    panel.hidden = isExpanded;
  });
});

// Project action buttons (Live/Case Study/etc.) open same in-card details.
const projectOpenMoreButtons = document.querySelectorAll('.project-open-more');
projectOpenMoreButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const targetId = button.getAttribute('data-target');
    if (!targetId) return;

    const panel = document.getElementById(targetId);
    if (!panel) return;

    const readMoreButton = document.querySelector('.project-read-more[aria-controls="' + targetId + '"]');
    if (!panel.hidden) return;

    panel.hidden = false;
    if (readMoreButton) {
      readMoreButton.setAttribute('aria-expanded', 'true');
      readMoreButton.textContent = 'Read Less';
    }
  });
});
