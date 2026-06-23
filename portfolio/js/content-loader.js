(function () {
  function text(selector, value, root) {
    var el = (root || document).querySelector(selector);
    if (el && value !== undefined && value !== null) el.textContent = value;
  }

  function html(selector, value, root) {
    var el = (root || document).querySelector(selector);
    if (el && value !== undefined && value !== null) el.innerHTML = value;
  }

  function setTags(host, tags) {
    if (!host) return;
    host.textContent = '';
    String(tags || '').split(',').map(function (tag) {
      return tag.trim();
    }).filter(Boolean).forEach(function (tag) {
      var span = document.createElement('span');
      span.className = host.classList.contains('blog-pg-tags') ? 'blog-pg-tag' : 'badge-tech';
      span.textContent = tag;
      host.appendChild(span);
    });
  }

  function applyProfile(content) {
    if (!content.profile) return;
    text('.hero-content .badge', content.profile.badge);
    html('.hero-title', String(content.profile.headline || '').replace(content.profile.name || 'Rakib', '<span class="highlight">' + (content.profile.name || 'Rakib') + '</span>') + '<span class="hero-underline"></span>');
    text('.hero-content > p', content.profile.summary);
    text('.location-icon', content.profile.location);
    var roleItems = document.querySelectorAll('.location-role span');
    if (roleItems[2]) roleItems[2].textContent = content.profile.institution || '';
    window.PORTFOLIO_TYPEWRITER_PHRASES = content.profile.typewriter || window.PORTFOLIO_TYPEWRITER_PHRASES;
  }

  function applyAbout(content) {
    if (!content.about) return;
    text('.aboutme-label', content.about.label);
    text('.aboutme-title', content.about.title);
    text('.aboutme-desc', content.about.primary);
    text('.aboutme-desc-secondary', content.about.secondary);
    text('.aboutme-quote', content.about.quote ? '"' + content.about.quote + '"' : '');
  }

  function applyProjects(content) {
    var projects = content.projects || [];
    document.querySelectorAll('.project-card').forEach(function (card, index) {
      var project = projects[index];
      if (!project) return;
      text('.project-kicker', project.meta, card);
      text('h3', project.title, card);
      text('.project-desc', project.description, card);
      var status = card.querySelector('.project-card-status');
      if (status) status.textContent = project.status || status.textContent;
      setTags(card.querySelector('.tech-badges'), project.tech);
      var live = card.querySelector('.project-link-live');
      if (live && live.tagName === 'A') {
        if (project.liveUrl) {
          live.href = project.liveUrl;
          live.hidden = false;
        } else {
          live.hidden = true;
        }
      }
      var code = card.querySelector('.project-link-code');
      if (code && project.codeUrl) code.href = project.codeUrl;
    });
  }

  function applyBlogs(content) {
    var blogs = content.blogs || [];
    document.querySelectorAll('.blog-card').forEach(function (card, index) {
      var blog = blogs[index];
      if (!blog) return;
      text('.blog-meta', [blog.date, blog.readTime].filter(Boolean).join(' · '), card);
      text('h3', blog.title, card);
      text('.project-desc', blog.description, card);
      setTags(card.querySelector('.tech-badges'), blog.tags);
    });

    document.querySelectorAll('.blog-pg-card').forEach(function (card, index) {
      var blog = blogs[index];
      if (!blog) return;
      text('.blog-pg-date', String(blog.date || '').toUpperCase(), card);
      text('.blog-pg-title', blog.title, card);
      text('.blog-pg-desc', blog.description, card);
      var footerTags = card.querySelector('.blog-pg-footer .blog-pg-tags');
      setTags(footerTags, blog.tags);
      text('.blog-pg-readtime', blog.readTime, card);
    });
  }

  function applySkills(content) {
    var skills = content.skills || [];
    document.querySelectorAll('.skill-ring-card').forEach(function (card, index) {
      var skill = skills[index];
      if (!skill) return;
      text('.srg-name', skill.name, card);
      text('.srg-pct', skill.level + '%', card);
      var fill = card.querySelector('.srg-fill');
      if (fill) fill.dataset.pct = skill.level;
      var center = card.querySelector('.srg-center span');
      if (center) center.textContent = String(skill.name || '').slice(0, 2).toUpperCase();
    });
  }

  function applyJourney(content) {
    var journey = content.journey || [];
    document.querySelectorAll('.timeline-item').forEach(function (item, index) {
      var step = journey[index];
      if (!step) return;
      text('.timeline-year', step.year, item);
      text('h3', step.title, item);
      text('p', step.description, item);
    });
  }

  function applyResume(content) {
    if (!document.querySelector('.resume-page') || !content.resume) return;
    text('.resume-header h1', content.profile && content.profile.name);
    text('.resume-header .subtitle', content.resume.subtitle);
    var contact = document.querySelector('.resume-header .contact');
    if (contact) {
      contact.querySelector('span:first-child').textContent = content.resume.location || '';
    }
    var education = content.resume.education || [];
    document.querySelectorAll('.resume-section:first-of-type .resume-item').forEach(function (item, index) {
      var edu = education[index];
      if (!edu) return;
      text('h3', edu.title, item);
      html('.meta', '<span>' + (edu.school || '') + '</span><span>' + (edu.period || '') + '</span>', item);
      var detail = item.querySelector('p:not(.meta)');
      if (detail) detail.textContent = edu.details || '';
    });
  }

  function applyContent(content) {
    window.PORTFOLIO_CONTENT = content;
    applyProfile(content);
    applyAbout(content);
    applyProjects(content);
    applyBlogs(content);
    applySkills(content);
    applyJourney(content);
    applyResume(content);
  }

  fetch('data/content.json', { cache: 'no-cache' })
    .then(function (response) { return response.ok ? response.json() : null; })
    .then(function (content) {
      if (content) applyContent(content);
    })
    .catch(function () {});
})();
