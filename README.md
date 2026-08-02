# Mahamudul Hasan Portfolio

Production portfolio for Mahamudul Hasan, built with semantic HTML, CSS, and vanilla JavaScript. The site includes projects, blogs, a gallery, a web CV with PDF download, and a secured Vercel contact API.

## Project layout

```text
.
|-- .github/workflows/       # CI and Vercel deployment
|-- api/                     # Vercel serverless contact endpoint
|-- database/                # Optional Supabase schema
|-- docs/                    # Deployment and security documentation
|-- portfolio/               # Production static website
|   |-- assets/
|   |   |-- documents/       # Public CV PDF
|   |   |-- icons/           # Favicon
|   |   |-- images/
|   |   |   |-- contact/     # Contact-page visual
|   |   |   |-- gallery/     # Gallery-only photos
|   |   |   `-- profile/     # Profile slider and shared photos
|   |   `-- music/           # Background audio
|   |-- css/                 # Shared styles
|   |-- data/                # Structured portfolio content
|   |-- js/                  # UI and content-loading scripts
|   `-- *.html               # Site pages
|-- resources/cv/            # Editable CV source; not deployed
|-- scripts/                 # Local preview and validation tools
|-- package.json
`-- vercel.json
```

## Local development

Requirements: Node.js 20 or newer.

```bash
npm run serve
```

Open `http://127.0.0.1:4173`. The static preview does not run the contact API; use `vercel dev` when testing serverless contact delivery.

## Validation

```bash
npm test
```

The test suite checks required files, JSON and JavaScript syntax, local HTML references, the CV PDF signature, removal of legacy deployment artifacts, and core contact API security responses.

## Content updates

- Profile, projects, blogs, skills, and timeline: `portfolio/data/content.json`
- Page markup: `portfolio/*.html`
- Shared styles: `portfolio/css/styles.css`
- Public CV: `portfolio/assets/documents/Md_Mahamudul_Hasan_Professional_CV.pdf`
- Editable CV source: `resources/cv/Md_Mahamudul_Hasan_Professional_CV.docx`

## Deployment

The production target is Vercel. Deploy from the repository root so `vercel.json`, the static portfolio, and the serverless API are included together. See `docs/DEPLOYMENT.md` and `docs/SECURITY.md`.

## Author

Mahamudul Hasan - CSE undergraduate and software engineering learner.
