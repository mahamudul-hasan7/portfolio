# 🌌 Rakib — Immersive Developer Experience

## Design Direction

- **Theme:** Dark cinematic, premium, Awwwards-style
- **Vibe:** Creative engineer, not just coder — experience-based storytelling
- **Motion:** 90% smoothness, 80% animation timing, 100% performance in mind

---

## 🎨 Color Palette

```css
/* Primary */
--bg-deep: #050508;
--bg-main: #0a0a0f;
--bg-card: #0f0f16;
--bg-elevated: #14141f;

/* Accent (brand) */
--accent: #00ff88;
--accent-dim: rgba(0, 255, 136, 0.15);
--accent-glow: rgba(0, 255, 136, 0.4);

/* Text */
--text-primary: #f5f5f7;
--text-secondary: #a1a1aa;
--text-muted: #71717a;

/* Borders / UI */
--border: rgba(255, 255, 255, 0.06);
--border-hover: rgba(0, 255, 136, 0.3);
```

**Tailwind equivalents:** Use `bg-[#050508]`, `text-[#00ff88]`, etc. or extend `theme` in `tailwind.config`.

---

## 📝 Typography

| Use | Font | Weight | Notes |
|-----|------|--------|--------|
| Hero headline | **Clash Display** or **Syne** | 700–800 | Big, bold, 4rem–6rem |
| Section titles | **Syne** or **Space Grotesk** | 600–700 | 2rem–3rem |
| Body | **Inter** or **DM Sans** | 400–500 | 1rem–1.125rem, line-height 1.6 |
| Labels / UI | **Space Grotesk** | 500 | 0.875rem |

**Google Fonts import (suggestion):**
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

---

## 🧠 Website Flow (Sections)

1. **Loader** — Short branded animation, then fade to hero
2. **Hero** — Fullscreen, 3D/WebGL bg, floating text, mouse-reactive, CTAs: "Explore Work" / "Enter Experience"
3. **Story** — Scroll-triggered text reveal, parallax, background morph (GSAP ScrollTrigger)
4. **Skills** — Interactive (3D sphere or filter toggles), no boring bars
5. **Projects** — Hover distortion, magnetic buttons, case-study pages
6. **Resume** — Vertical timeline, scroll reveal, count-up stats, download CTA
7. **Contact** — Animated form, gradient border, magnetic submit

---

## 🛠 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Motion | Framer Motion + GSAP (ScrollTrigger) |
| 3D | React Three Fiber + Three.js |
| Smooth scroll | Lenis |
| Deploy | Vercel |

---

## 📂 Folder Structure (Next.js)

```
/app
  layout.js
  page.js
  globals.css
  /components
    /ui
    Hero.jsx
    StorySection.jsx
    Skills.jsx
    Projects.jsx
    Timeline.jsx
    Contact.jsx
    Cursor.jsx
    Loader.jsx
  /projects
    [slug]/page.jsx
/lib
  lenis.js
  gsap.js
/public
```

---

## 🚀 Phased Roadmap

| Phase | Focus | Deliverables |
|-------|--------|--------------|
| **1** | Layout + responsive structure | App shell, nav, footer, all sections as placeholders |
| **2** | Animation (Framer Motion) | Page transitions, section fade-in, hover states |
| **3** | GSAP scroll effects | ScrollTrigger, text reveal, parallax |
| **4** | Three.js hero | WebGL background, mouse-reactive camera, 3D text |
| **5** | Polish | Custom cursor, loader, sound toggle, performance pass |

---

## ✅ Checklist (Awwwards-level)

- [ ] Page loader
- [ ] Custom cursor
- [ ] Dark (default) / Light toggle
- [ ] Lenis smooth scroll
- [ ] Hero: 3D or video bg + bold typography
- [ ] Scroll-triggered story section
- [ ] Skills: interactive (no static bars)
- [ ] Projects: hover effect + case study pages
- [ ] Resume: timeline + download
- [ ] Contact: magnetic button + success animation
- [ ] 100% performance (Lighthouse 90+)

---

*Branding: **Rakib** · Creative Engineer · CSE, United International University*
