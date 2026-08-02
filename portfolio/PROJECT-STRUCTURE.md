# Portfolio – Project Structure

```
portfolio/
├── index.html          # Main page (single-page layout)
├── resume.html         # CV / Resume page
├── blogs.html          # Blogs listing
├── projects.html       # Projects (standalone)
├── contact.html        # Contact (standalone)
├── gallery.html        # Gallery
│
├── css/
│   └── styles.css      # All styles
│
├── js/
│   ├── script.js       # Theme, scroll, animations, contact form
│   └── content-loader.js # Loads static portfolio content safely
│
├── data/
│   └── content.json    # Profile, projects, blogs, skills, journey
│
├── assets/
│   └── images/         # rakib.jpg, rakib2.jpg, favicon.png, etc.
│
└── PROJECT-STRUCTURE.md
```

## Quick Edit Guide

| What to change        | File           |
|-----------------------|----------------|
| Profile and section content | `data/content.json` |
| Page structure        | `index.html` and other HTML files |
| Colors, layout        | `css/styles.css` |
| Animations, theme    | `js/script.js` |
| Resume content       | `resume.html`  |
| Images               | Root or `assets/images/` |

## Run

Open `index.html` in browser, or use a local server (e.g. Live Server extension).
