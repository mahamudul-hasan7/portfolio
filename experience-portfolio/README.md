# 🌌 Experience Portfolio — Awwwards-Style

Immersive developer experience for **Rakib**. Dark cinematic theme, smooth animations, storytelling scroll.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Framer Motion**
- **GSAP** (ready to add ScrollTrigger)
- **Three.js / R3F** (ready to add in Hero)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s Included

- **Loader** — Short branded intro
- **Hero** — Fullscreen, bold typography, CTAs (WebGL/3D can be added in Phase 4)
- **Story** — Scroll-triggered text reveal
- **Skills** — Filter (Frontend / Backend / Tools), hover states
- **Projects** — Cards with Live / Code links
- **Contact** — Form with success state

## Admin Panel

- Open `/admin` to manage portfolio content and contact messages.
- Protect it with these environment variables:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=generate-a-long-random-secret
```

- The admin panel updates the shared store in `data/portfolio-store.json`.
- Contact form submissions are saved through `/api/contact` and can be moderated in the inbox panel.
- For production, change the default credentials immediately and keep the session secret long and random.

## Next Steps (from DESIGN-BLUEPRINT.md)

1. **Phase 3:** Add GSAP ScrollTrigger for parallax and section effects
2. **Phase 4:** Add React Three Fiber hero background + mouse-reactive camera
3. **Phase 5:** Custom cursor, Lenis smooth scroll, magnetic buttons, hover distortion on projects

Design blueprint, color palette, and typography: see `DESIGN-BLUEPRINT.md`.
