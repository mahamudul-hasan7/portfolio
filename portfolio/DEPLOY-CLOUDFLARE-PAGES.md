# Deploy mahamud.xyz on Cloudflare Pages (Free)

This project is static and ready for free hosting on Cloudflare Pages.

## 1) Push this folder to GitHub

Put the `portfolio` folder in a GitHub repository.

## 2) Create Cloudflare Pages project

1. Log in to Cloudflare Dashboard.
2. Go to `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select your GitHub repository.
4. Configure build:
- Framework preset: `None`
- Build command: leave empty
- Build output directory: `portfolio`
5. Click `Save and Deploy`.

## 3) Connect custom domain

1. In your Pages project, go to `Custom domains`.
2. Add:
- `mahamud.xyz`
- `www.mahamud.xyz`
3. Cloudflare will show required DNS records.

## 4) Update DNS in ExonHost

In ExonHost panel -> DNS Zone Editor, add exactly what Cloudflare shows.

Typical setup:
- `CNAME` name `www` -> `<your-project>.pages.dev`
- Root `@` record as instructed by Cloudflare (often flattened CNAME or A record)

Remove old conflicting `A`/`CNAME` records for `@` and `www`.

## 5) Wait for SSL and propagation

- SSL: usually a few minutes
- DNS propagation: 5 min to 24 hours

## 6) Final check

Open:
- `https://mahamud.xyz`
- `https://www.mahamud.xyz`

If one works and one fails, re-check DNS records and conflicts.

## Notes

- `_headers` and `_redirects` are already added in this folder for better cache/security behavior.
- Re-deploy happens automatically when you push new commits.
