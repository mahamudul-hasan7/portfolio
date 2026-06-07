Vercel deployment guide

1) Create GitHub repository
  - git init
  - git add .
  - git commit -m "Initial commit"
  - git remote add origin <your-github-repo-url>
  - git push -u origin main

2) Connect repository on Vercel
  - In Vercel dashboard, choose "Import Project" → select your GitHub repo.
  - When prompted for Project Root, set it to: `experience-portfolio`
  - Framework preset: `Next.js` (Vercel should detect automatically).

3) Environment variables (set in Vercel project Settings → Environment Variables)
  - `NODE_ENV` = production

4) Build & deploy
  - Vercel will run `npm install` and `npm run build` in the `experience-portfolio` folder.
  - After deploy, enable HTTPS and point your DNS to Vercel per their instructions.

5) Post-deploy notes
  - This project no longer includes an admin panel. Manage content by editing `experience-portfolio/data/portfolio-store.json` locally and redeploying, or integrate an external CMS/storage for remote edits.
