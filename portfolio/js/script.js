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
      link.addEventListener('click', function() {
        const href = link.getAttribute('href') || '';
        if (href.charAt(0) === '#') {
          hashNavLinks.forEach(function(item) { item.classList.remove('active'); });
          link.classList.add('active');
        }
        closeMobileMenu();
      });
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 900) {
        closeMobileMenu();
      }
    });
  }

  function onScroll() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    const navOffset = (nav ? nav.offsetHeight : 0) + 16;
    let activeId = '';

    sections.forEach(function(section) {
      if (!section.id) return;
      if (section.offsetTop - navOffset <= scrollPos) {
        activeId = section.id;
      }
    });

    hashNavLinks.forEach(function(link) {
      const id = (link.getAttribute('href') || '').substring(1);
      link.classList.toggle('active', id === activeId);
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
document.addEventListener('DOMContentLoaded', async function() {
  const defaultProfileImages = [
    'rakib.jpg',
    'rakib2.jpg',
    'rakib3.jpg',
    'rakib4.jpg'
  ];

  function uniqueStrings(list) {
    const seen = new Set();
    return list.filter(function(item) {
      if (typeof item !== 'string') return false;
      const value = item.trim();
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  function checkImageExists(src) {
    return new Promise(function(resolve) {
      const probe = new Image();
      probe.onload = function() { resolve(true); };
      probe.onerror = function() { resolve(false); };
      probe.src = src;
    });
  }

  async function detectPatternImages() {
    const candidates = ['rakib.jpg'];
    for (let i = 2; i <= 30; i += 1) {
      candidates.push('rakib' + i + '.jpg');
    }

    const found = [];
    for (const candidate of candidates) {
      // Probe files in sequence so naming order stays stable in the slider.
      const exists = await checkImageExists(candidate);
      if (exists) found.push(candidate);
    }
    return found;
  }

  const configuredImages = Array.isArray(window.PORTFOLIO_PROFILE_IMAGES)
    ? uniqueStrings(window.PORTFOLIO_PROFILE_IMAGES)
    : [];
  const autoDetectedImages = await detectPatternImages();
  const profileImages = uniqueStrings(configuredImages.concat(autoDetectedImages));
  const finalProfileImages = profileImages.length > 0 ? profileImages : defaultProfileImages;

  let currentProfile = 0;
  const profileSlider = document.getElementById('profileSlider');
  if (profileSlider && finalProfileImages.length > 0) {
    profileSlider.src = finalProfileImages[0];
    let isAnimating = false;
    setInterval(() => {
      if (isAnimating) return;
      if (finalProfileImages.length <= 1) return;
      isAnimating = true;
      profileSlider.classList.add('profile-slider-slide');
      setTimeout(() => {
        currentProfile = (currentProfile + 1) % finalProfileImages.length;
        profileSlider.src = finalProfileImages[currentProfile];
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
// Smooth scroll with sticky-navbar offset for all in-page anchors.
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const nav = document.querySelector('.navbar');
    const navHeight = nav ? nav.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = (document.getElementById('contactName') && document.getElementById('contactName').value || '').trim();
    const email = (document.getElementById('contactEmail') && document.getElementById('contactEmail').value || '').trim();
    const message = (document.getElementById('contactMessage') && document.getElementById('contactMessage').value || '').trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      contactSuccess.textContent = 'Please fill in all fields before sending.';
      contactSuccess.classList.add('visible');
      setTimeout(function() {
        contactSuccess.classList.remove('visible');
      }, 2200);
      return;
    }

    const oldBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const payload = {
      name: name,
      email: email,
      message: message,
      _subject: 'Portfolio Contact',
      _captcha: 'false'
    };

    const oldSuccessText = contactSuccess.textContent;

    try {
      const response = await fetch('https://formsubmit.co/ajax/mahamud.7info@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(function() { return {}; });
      if (!response.ok || (data && data.success === false)) {
        throw new Error('Request failed');
      }

      contactSuccess.textContent = 'Message sent successfully.';
      contactSuccess.classList.add('visible');
      contactForm.reset();
      setTimeout(function() {
        contactSuccess.classList.remove('visible');
        contactSuccess.textContent = oldSuccessText;
      }, 3200);
    } catch (err) {
      contactSuccess.textContent = 'Message could not be sent right now. Please try again.';
      contactSuccess.classList.add('visible');
      setTimeout(function() {
        contactSuccess.classList.remove('visible');
        contactSuccess.textContent = oldSuccessText;
      }, 3200);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldBtnText || 'Send Message';
      }
    }
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
