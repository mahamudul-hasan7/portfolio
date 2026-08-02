// ============================================
// MAHAMUDUL HASAN PORTFOLIO - Main JavaScript
// Organized: js/script.js
// ============================================

// Preserve scroll position across page reloads.
const RELOAD_SCROLL_KEY = 'portfolio-scroll-y';

// Disable browser's own scroll restoration so it doesn't fight us.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function _saveScrollPos() {
  try {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    sessionStorage.setItem(RELOAD_SCROLL_KEY, String(scrollY));
    window._reloadScrollTarget = scrollY;
  } catch (e) {
    window._reloadScrollTarget = 0;
  }
}

function _restoreScrollPos() {
  try {
    const stored = Number(sessionStorage.getItem(RELOAD_SCROLL_KEY) || '0');
    window._reloadScrollTarget = Number.isFinite(stored) ? stored : 0;
    if (window._reloadScrollTarget > 0) {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          window.scrollTo(0, window._reloadScrollTarget);
        });
      });
    }
  } catch (e) {
    window._reloadScrollTarget = 0;
  }
}

window.addEventListener('beforeunload', _saveScrollPos, { passive: true });
window.addEventListener('pageshow', _restoreScrollPos);

function applyPortfolioTheme(isLight) {
  if (isLight) {
    document.documentElement.classList.add('light');
    document.body.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.remove('light');
    document.body.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }
}

function getCurrentThemeIsLight() {
  return document.documentElement.classList.contains('light') || document.body.classList.contains('light');
}

applyPortfolioTheme(getCurrentThemeIsLight());

// Dark/Light mode toggle — Pull Chain Lamp (3D drag)
const lampToggle = document.getElementById('lampToggle');
if (lampToggle) {
  var _chainWrap = document.getElementById('lampChainWrap');
  var _PULL_THRESHOLD = 9;
  var _MAX_DRAG = 22;
  var _dragging = false;

  applyPortfolioTheme(getCurrentThemeIsLight());

  function _triggerPull() {
    if (_chainWrap) {
      _chainWrap.style.transition = '';
      _chainWrap.style.transform = '';
    }
    lampToggle.classList.remove('pulling');
    void lampToggle.offsetWidth;
    lampToggle.classList.add('pulling');
    setTimeout(function () { lampToggle.classList.remove('pulling'); }, 640);
    applyPortfolioTheme(!getCurrentThemeIsLight());
  }

  /* — Mouse drag — */
  lampToggle.addEventListener('mousedown', function (e) {
    e.preventDefault();
    _dragging = false;
    var startY = e.clientY;

    function onMove(ev) {
      var dy = Math.max(0, Math.min(ev.clientY - startY, _MAX_DRAG));
      if (dy > 3) _dragging = true;
      if (_chainWrap) {
        _chainWrap.style.transition = 'none';
        _chainWrap.style.transform = 'translateY(' + dy + 'px) scaleY(' + (1 - dy * 0.006) + ')';
      }
    }

    function onUp(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      var dy = ev.clientY - startY;
      if (dy >= _PULL_THRESHOLD) {
        // _triggerPull will reset chain; let it own the animation
        if (_chainWrap) {
          _chainWrap.style.transition = 'none';
          _chainWrap.style.transform = '';
        }
        _triggerPull();
      } else {
        // Spring snap-back: smooth settle to rest position
        if (_chainWrap) {
          _chainWrap.style.transition = 'transform 0.46s cubic-bezier(0.34, 1.38, 0.64, 1)';
          _chainWrap.style.transform  = 'translateY(0) scaleY(1)';
        }
      }
      setTimeout(function () { _dragging = false; }, 20);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  /* Click fallback (no drag happened) */
  lampToggle.addEventListener('click', function () {
    if (!_dragging) _triggerPull();
  });

  /* — Touch drag — */
  var _touchStartY = 0;
  lampToggle.addEventListener('touchstart', function (e) {
    _touchStartY = e.touches[0].clientY;
    _dragging = false;
  }, { passive: true });

  lampToggle.addEventListener('touchmove', function (e) {
    var dy = Math.max(0, Math.min(e.touches[0].clientY - _touchStartY, _MAX_DRAG));
    if (dy > 3) _dragging = true;
    if (_chainWrap) {
      _chainWrap.style.transition = 'none';
      _chainWrap.style.transform = 'translateY(' + dy + 'px) scaleY(' + (1 - dy * 0.006) + ')';
    }
  }, { passive: true });

  lampToggle.addEventListener('touchend', function (e) {
    var dy = e.changedTouches[0].clientY - _touchStartY;
    if (_chainWrap) {
      _chainWrap.style.transition = '';
      _chainWrap.style.transform = '';
    }
    if (dy >= _PULL_THRESHOLD) _triggerPull();
    setTimeout(function () { _dragging = false; }, 20);
  });

  /* Keyboard */
  lampToggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      _triggerPull();
    }
  });
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  function updateThemeToggleLabel() {
    themeToggle.textContent = getCurrentThemeIsLight() ? '☀' : '☾';
    themeToggle.setAttribute('aria-pressed', String(getCurrentThemeIsLight()));
  }

  themeToggle.addEventListener('click', function() {
    applyPortfolioTheme(!getCurrentThemeIsLight());
    updateThemeToggleLabel();
  });

  updateThemeToggleLabel();
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
    // limit probes to a few files to avoid many 404s and heavy network I/O
    const candidates = ['rakib.jpg'];
    for (let i = 2; i <= 6; i += 1) {
      candidates.push('rakib' + i + '.jpg');
    }

    // Probe all candidates in parallel — much faster than sequential await
    const results = await Promise.all(candidates.map(function(c) {
      return checkImageExists(c).then(function(ok) { return ok ? c : null; });
    }));
    // Filter nulls while preserving order
    return results.filter(Boolean);
  }

  const configuredImages = Array.isArray(window.PORTFOLIO_PROFILE_IMAGES)
    ? uniqueStrings(window.PORTFOLIO_PROFILE_IMAGES)
    : [];
  const fallbackProfileImages = configuredImages.length > 0
    ? configuredImages
    : defaultProfileImages;

  const profileCircle = document.querySelector('#hero .profile-circle');
  let heroMediaRevealed = false;
  function revealHeroMedia() {
    if (heroMediaRevealed) return;
    heroMediaRevealed = true;
    if (profileCircle) {
      profileCircle.classList.remove('media-pending');
    }
    // Re-apply scroll after this layout shift (media-pending removal causes reflow)
    if (window._reloadScrollTarget > 0) {
      requestAnimationFrame(function() {
        window.scrollTo(0, window._reloadScrollTarget);
      });
    }
  }

  const profileSlider = document.getElementById('profileSlider');
  const quickSlideDurationMs = 3500;

  // Prevent reload flash of the hardcoded first image by setting a clock-synced image instantly.
  if (profileSlider && fallbackProfileImages.length > 0) {
    const quickIndex = Math.floor(Date.now() / quickSlideDurationMs) % fallbackProfileImages.length;
    profileSlider.src = fallbackProfileImages[quickIndex];
  }

  // Sync orbit icon phase immediately so reload does not show first-cycle behavior.
  const orbitIconsEarly = document.querySelectorAll('#hero .skills-icons .icon');
  if (orbitIconsEarly.length > 0) {
    const parseCssTimeToMsEarly = function(value) {
      if (!value || typeof value !== 'string') return 0;
      const first = value.split(',')[0].trim();
      if (first.endsWith('ms')) {
        const num = parseFloat(first.slice(0, -2));
        return Number.isFinite(num) ? num : 0;
      }
      if (first.endsWith('s')) {
        const num = parseFloat(first.slice(0, -1));
        return Number.isFinite(num) ? num * 1000 : 0;
      }
      return 0;
    };

    const syncOrbitIconsEarly = function() {
      const now = Date.now();
      orbitIconsEarly.forEach(function(icon) {
        const style = window.getComputedStyle(icon);
        const durationMs = parseCssTimeToMsEarly(style.animationDuration) || 13800;
        const offsetMs = now % durationMs;
        icon.style.animationDelay = '-' + (offsetMs / 1000).toFixed(3) + 's';
        icon.style.animationPlayState = 'running';
      });
    };

    syncOrbitIconsEarly();
    window.requestAnimationFrame(function() {
      syncOrbitIconsEarly();
      revealHeroMedia();
    });
  } else {
    window.requestAnimationFrame(function() {
      revealHeroMedia();
    });
  }

  const autoDetectedImages = configuredImages.length > 0
    ? []
    : await detectPatternImages();
  const profileImages = uniqueStrings(configuredImages.concat(autoDetectedImages));
  const finalProfileImages = profileImages.length > 0 ? profileImages : fallbackProfileImages;

  if (profileSlider && finalProfileImages.length > 0) {
    const slideDurationMs = 3500;
    const imageCount = finalProfileImages.length;
    const switchDelayMs = 430;
    const animationResetMs = 980;
    const pollIntervalMs = 180;
    const resumeSettlingMs = 950;

    let currentProfile = 0;
    let lastClockStep = Math.floor(Date.now() / slideDurationMs);
    let imageSwapTimer = null;
    let animationResetTimer = null;
    let sliderInterval = null;
    let suppressAnimationUntil = 0;

    function startSliderLoop() {
      if (sliderInterval) return;
      sliderInterval = window.setInterval(tickSlider, pollIntervalMs);
    }

    function stopSliderLoop() {
      if (!sliderInterval) return;
      clearInterval(sliderInterval);
      sliderInterval = null;
    }

    function clearSlideAnimation() {
      if (imageSwapTimer) {
        clearTimeout(imageSwapTimer);
        imageSwapTimer = null;
      }
      profileSlider.classList.remove('profile-slider-slide');
      if (animationResetTimer) {
        clearTimeout(animationResetTimer);
        animationResetTimer = null;
      }
    }

    function applyStep(step, withAnimation) {
      const nextIndex = ((step % imageCount) + imageCount) % imageCount;
      if (nextIndex === currentProfile) return;

      if (withAnimation) {
        clearSlideAnimation();
        // Force reflow so re-adding the class reliably restarts keyframes.
        void profileSlider.offsetWidth;
        profileSlider.classList.add('profile-slider-slide');

        imageSwapTimer = setTimeout(function() {
          currentProfile = nextIndex;
          profileSlider.src = finalProfileImages[currentProfile];
          imageSwapTimer = null;
        }, switchDelayMs);

        animationResetTimer = setTimeout(function() {
          clearSlideAnimation();
        }, animationResetMs);
      } else {
        clearSlideAnimation();
        currentProfile = nextIndex;
        profileSlider.src = finalProfileImages[currentProfile];
      }
    }

    function findImageIndexBySrc(images, currentSrc) {
      if (!currentSrc) return -1;
      const normalizedSrc = String(currentSrc).toLowerCase();
      for (let i = 0; i < images.length; i += 1) {
        const name = String(images[i] || '').toLowerCase();
        if (name && normalizedSrc.endsWith('/' + name)) {
          return i;
        }
      }
      return -1;
    }

    function tickSlider() {
      const now = Date.now();
      const stepNow = Math.floor(now / slideDurationMs);
      if (stepNow === lastClockStep) return;

      const stepDiff = stepNow - lastClockStep;
      const pageVisible = document.visibilityState === 'visible';
      const canAnimateNow = now >= suppressAnimationUntil;
      const shouldAnimate = pageVisible && document.hasFocus() && stepDiff === 1 && canAnimateNow;

      applyStep(stepNow, shouldAnimate);
      lastClockStep = stepNow;
    }

    const existingIndex = findImageIndexBySrc(finalProfileImages, profileSlider.getAttribute('src') || profileSlider.src);
    if (existingIndex >= 0) {
      currentProfile = existingIndex;
    } else {
      currentProfile = ((lastClockStep % imageCount) + imageCount) % imageCount;
      profileSlider.src = finalProfileImages[currentProfile];
    }

    startSliderLoop();

    // Ensure we resync immediately after tab visibility changes.
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        clearSlideAnimation();
        suppressAnimationUntil = Date.now() + resumeSettlingMs;
        return;
      }
      const stepNow = Math.floor(Date.now() / slideDurationMs);
      applyStep(stepNow, false);
      lastClockStep = stepNow;
      suppressAnimationUntil = Date.now() + resumeSettlingMs;
    });

    window.addEventListener('blur', function() {
      clearSlideAnimation();
      suppressAnimationUntil = Date.now() + resumeSettlingMs;
    });

    window.addEventListener('focus', function() {
      const stepNow = Math.floor(Date.now() / slideDurationMs);
      applyStep(stepNow, false);
      lastClockStep = stepNow;
      suppressAnimationUntil = Date.now() + resumeSettlingMs;
    });

    // Cleanup for page transitions to avoid orphaned timers.
    window.addEventListener('beforeunload', function() {
      stopSliderLoop();
      clearSlideAnimation();
    }, { once: true });
  }

  const orbitIcons = document.querySelectorAll('#hero .skills-icons .icon');
  if (orbitIcons.length > 0) {
    function parseCssTimeToMs(value) {
      if (!value || typeof value !== 'string') return 0;
      const first = value.split(',')[0].trim();
      if (first.endsWith('ms')) {
        const num = parseFloat(first.slice(0, -2));
        return Number.isFinite(num) ? num : 0;
      }
      if (first.endsWith('s')) {
        const num = parseFloat(first.slice(0, -1));
        return Number.isFinite(num) ? num * 1000 : 0;
      }
      return 0;
    }

    function syncOrbitIconsToClock() {
      const now = Date.now();
      orbitIcons.forEach(function(icon) {
        const style = window.getComputedStyle(icon);
        const durationMs = parseCssTimeToMs(style.animationDuration) || 13800;
        const offsetMs = now % durationMs;
        icon.style.animationDelay = '-' + (offsetMs / 1000).toFixed(3) + 's';
        icon.style.animationPlayState = 'running';
      });
    }

    syncOrbitIconsToClock();

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        syncOrbitIconsToClock();
      }
    });

    window.addEventListener('focus', function() {
      syncOrbitIconsToClock();
    });

    window.addEventListener('pageshow', function() {
      syncOrbitIconsToClock();
    });
  }

  const fadeEls = document.querySelectorAll('.fade-in:not(.hero-content)');
  const revealEls = document.querySelectorAll('.reveal');

  // Stagger sibling .fade-in elements that share a parent
  (function staggerSiblings() {
    var parents = new Map();
    fadeEls.forEach(function(el) {
      var p = el.parentElement;
      if (!p) return;
      if (!parents.has(p)) parents.set(p, []);
      parents.get(p).push(el);
    });
    parents.forEach(function(children) {
      if (children.length < 2) return;
      // Mark the parent for CSS stagger
      children[0].parentElement.classList.add('sr-stagger');
    });
  })();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('fade-in')) {
          el.style.animationPlayState = 'running';
          el.classList.add('sr-revealed');
          // Also play any fade-in children
          el.querySelectorAll('.fade-in').forEach(function(child) {
            child.style.animationPlayState = 'running';
          });
        }
        if (el.classList.contains('reveal')) {
          el.classList.add('revealed');
        }
        observer.unobserve(el);
      });
    }, {
      root: null,
      rootMargin: '0px 0px -72px 0px',
      threshold: 0.06
    });

    fadeEls.forEach(function(el) { revealObserver.observe(el); });
    revealEls.forEach(function(el) { revealObserver.observe(el); });
  } else {
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
  var contactStartedAt = Date.now();
  var contactStartedInput = document.getElementById('contactStartedAt');
  if (contactStartedInput) contactStartedInput.value = String(contactStartedAt);
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = (document.getElementById('contactName') && document.getElementById('contactName').value || '').trim();
    const email = (document.getElementById('contactEmail') && document.getElementById('contactEmail').value || '').trim();
    const phone = (document.getElementById('contactPhone') && document.getElementById('contactPhone').value || '').trim();
    const subject = (document.getElementById('contactSubject') && document.getElementById('contactSubject').value || '').trim();
    const message = (document.getElementById('contactMessage') && document.getElementById('contactMessage').value || '').trim();
    const hp = (document.getElementById('contactHp') && document.getElementById('contactHp').value || '').trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Honeypot check: if filled, silently treat as spam (don't send)
    if (hp) {
      contactSuccess.textContent = 'Message sent successfully.';
      contactSuccess.classList.add('visible');
      setTimeout(function() { contactSuccess.classList.remove('visible'); }, 2200);
      if (submitBtn) { submitBtn.disabled = false; }
      return;
    }

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

    const oldSuccessText = contactSuccess.textContent;

    try {
      const response = await fetch(contactForm.getAttribute('action') || '/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email, phone: phone, subject: subject, message: message, hp: hp, startedAt: contactStartedAt })
      });

      if (!response.ok) {
        const data = await response.json().catch(function() { return {}; });
        throw new Error(data.error || 'Request failed');
      }

      contactSuccess.textContent = 'Message sent successfully.';
      contactSuccess.classList.add('visible');
      contactForm.reset();
      contactStartedAt = Date.now();
      if (contactStartedInput) contactStartedInput.value = String(contactStartedAt);
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

// Back to top button behavior
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  var showAt = 120;
  var ticking = false;

  function update() {
    var sc = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle('visible', sc > showAt);
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.blur();
  });

  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });

  update();
})();

// Skills v2: ring fill + counter animations
(function () {
  var _wrapper = document.querySelector('.skills-wrapper');
  if (!_wrapper) return;
  var _circumference = 175.93;

  function _fillRings() {
    document.querySelectorAll('.srg-fill').forEach(function (ring) {
      var pct = parseFloat(ring.dataset.pct) / 100;
      ring.style.stroke = ring.dataset.color;
      ring.style.strokeDashoffset = _circumference * (1 - pct);
    });
  }

  function _countUp() {
    document.querySelectorAll('.skill-stat-num').forEach(function (el) {
      var target = parseInt(el.dataset.target, 10);
      var t0 = null;
      requestAnimationFrame(function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1400, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }

  if ('IntersectionObserver' in window) {
    var _fired = false;
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting || _fired) return;
      _fired = true;
      setTimeout(_fillRings, 220);
      setTimeout(_countUp, 360);
      obs.disconnect();
    }, { threshold: 0.1 }).observe(_wrapper);
  } else {
    _fillRings();
    _countUp();
  }
})();

// ── Music Player ──
(function () {
  var btn       = document.getElementById('musicBtn');
  var audio     = document.getElementById('bgMusic');
  var iconPlay  = btn && btn.querySelector('.music-icon-play');
  var iconPause = btn && btn.querySelector('.music-icon-pause');
  if (!btn || !audio) return;

  // এখানে নতুন file যোগ করো — যেগুলো নেই সেগুলো auto skip হবে
  var playlist = [
    'assets/music/background.mp3'
  ];
  var available  = playlist.slice();
  var playing    = false;
  var currentSrc = '';

  // Use metadata preload only to avoid downloading the full audio immediately
  try {
    audio.preload = 'metadata';
    // Do not call load() to prevent immediate full download on low-bandwidth devices
  } catch (e) {
    // ignore
  }

  function setUI(state) {
    playing = state;
    btn.classList.toggle('playing', state);
    btn.setAttribute('aria-pressed', String(state));
    btn.setAttribute('aria-label', state ? 'Pause background music' : 'Play background music');
    iconPlay.style.display  = state ? 'none' : '';
    iconPause.style.display = state ? '' : 'none';
  }

  function pickRandom(exclude) {
    var pool = available.filter(function (s) { return s !== exclude; });
    if (!pool.length) pool = available.slice();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function tryPlay(exclude) {
    var src = pickRandom(exclude);
    if (!src) { setUI(false); return; }
    currentSrc = src;
    audio.src  = src;
    audio.load();
    audio.play()
      .then(function () { setUI(true); })
      .catch(function () { setUI(false); });
  }

  // গান শেষ হলে নতুন random গান বাজবে
  audio.addEventListener('ended', function () {
    tryPlay(currentSrc);
  });

  // file না থাকলে সেটা playlist থেকে বাদ দিয়ে পরেরটা চেষ্টা করবে
  audio.addEventListener('error', function () {
    available = available.filter(function (s) { return s !== currentSrc; });
    if (playing) tryPlay(currentSrc);
  });

  btn.addEventListener('click', function () {
    if (playing) {
      audio.pause();
      setUI(false);
    } else {
      if (currentSrc) {
        audio.play()
          .then(function () { setUI(true); })
          .catch(function () { tryPlay(currentSrc); });
      } else {
        tryPlay(null);
      }
    }
  });
})();

/* ─────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────── */
(function () {
  var bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  function updateBar() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
})();

/* ─────────────────────────────────────────
   TYPEWRITER HERO TEXT
───────────────────────────────────────── */
(function () {
  var el = document.getElementById('typewriterText');
  if (!el) return;

  var phrases = Array.isArray(window.PORTFOLIO_TYPEWRITER_PHRASES) && window.PORTFOLIO_TYPEWRITER_PHRASES.length
    ? window.PORTFOLIO_TYPEWRITER_PHRASES
    : [
    'CSE Student & Developer',
    'Problem Solver',
    'Builder',
    'Open to Opportunities'
  ];

  var phraseIndex  = 0;
  var charIndex    = 0;
  var isDeleting   = false;
  var typeDelay    = 72;   // ms per character when typing
  var deleteDelay  = 38;   // ms per character when deleting
  var pauseAfter   = 1800; // ms to pause when phrase is complete
  var pauseBefore  = 420;  // ms before starting to delete

  function tick() {
    var current = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Phrase complete — pause then start deleting
        isDeleting = true;
        setTimeout(tick, pauseAfter);
        return;
      }
      setTimeout(tick, typeDelay);
    } else {
      // Deleting
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Done deleting — move to next phrase
        isDeleting   = false;
        phraseIndex  = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, pauseBefore);
        return;
      }
      setTimeout(tick, deleteDelay);
    }
  }

  // Start after a short initial delay
  setTimeout(tick, 800);
})();

/* ─────────────────────────────────────────
   LIVE DHAKA TIME
───────────────────────────────────────── */
(function () {
  var el = document.getElementById('dhakaTime');
  if (!el) return;

  function updateTime() {
    var now = new Date();
    // Bangladesh Standard Time = UTC+6
    var bstOffset = 6 * 60;
    var localOffset = now.getTimezoneOffset(); // minutes behind UTC
    var bstTime = new Date(now.getTime() + (bstOffset + localOffset) * 60000);

    var hours = bstTime.getHours();
    var mins  = bstTime.getMinutes();
    var ampm  = hours >= 12 ? 'PM' : 'AM';
    var h12   = hours % 12 || 12;
    var m2    = mins < 10 ? '0' + mins : String(mins);

    el.textContent = h12 + ':' + m2 + ' ' + ampm + ' · Dhaka';
  }

  updateTime();
  setInterval(updateTime, 1000);
})();

/* ─────────────────────────────────────────
   SKILL RING TOOLTIP
───────────────────────────────────────── */
(function () {
  var tip = document.getElementById('skTooltip');
  if (!tip) return;

  document.querySelectorAll('.skill-ring-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var nameEl = card.querySelector('.srg-name');
      var pctEl  = card.querySelector('.srg-pct');
      var years  = card.dataset.years || '';
      if (!nameEl) return;

      // Build tooltip content using safe DOM/text nodes to avoid XSS
      tip.textContent = '';
      var nameSpan = document.createElement('span');
      nameSpan.className = 'stt-name';
      nameSpan.textContent = nameEl.textContent || '';

      var rowDiv = document.createElement('div');
      rowDiv.className = 'stt-row';

      var pctSpan = document.createElement('span');
      pctSpan.className = 'stt-pct';
      pctSpan.textContent = pctEl ? pctEl.textContent : '';

      var sepSpan = document.createElement('span');
      sepSpan.className = 'stt-sep';
      sepSpan.textContent = '·';

      var yearsSpan = document.createElement('span');
      yearsSpan.className = 'stt-years';
      yearsSpan.textContent = years;

      rowDiv.appendChild(pctSpan);
      rowDiv.appendChild(sepSpan);
      rowDiv.appendChild(yearsSpan);

      tip.appendChild(nameSpan);
      tip.appendChild(rowDiv);

      positionTip(card);
      tip.classList.add('stt-visible');
    });

    card.addEventListener('mouseleave', function () {
      tip.classList.remove('stt-visible');
    });
  });

  function positionTip(card) {
    var rect = card.getBoundingClientRect();
    var tipH = tip.offsetHeight || 54;
    var tipW = tip.offsetWidth  || 130;
    var left = rect.left + rect.width  / 2 - tipW / 2;
    var top  = rect.top  - tipH - 10;
    // Flip below card if not enough room above
    if (top < 8) top = rect.bottom + 10;
    // Clamp horizontally inside viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }
})();
