# Portfolio Admin Setup

This admin panel is designed for free GitHub + Vercel hosting without putting the admin password in frontend code.

## Admin URL

After deployment, open:

```text
/admin.html
```

The page is public, but content APIs are protected with an HttpOnly session cookie.

## Required Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```text
ADMIN_PASSWORD_SALT=generated_salt
ADMIN_PASSWORD_HASH=generated_hash
ADMIN_SESSION_SECRET=long_random_secret
GITHUB_TOKEN=github_personal_access_token
GITHUB_REPO=owner/repository-name
GITHUB_BRANCH=main
```

Optional:

```text
CONTENT_PATH=portfolio/data/content.json
```

## Generate Password Hash

Use a strong password with at least 12 characters. Locally, run:

```powershell
node -e "const crypto=require('crypto'); const password='YOUR_STRONG_PASSWORD_HERE'; const salt=crypto.randomBytes(16).toString('hex'); const hash=crypto.scryptSync(password,salt,64).toString('hex'); console.log({salt,hash});"
```

Put the printed `salt` and `hash` into Vercel as `ADMIN_PASSWORD_SALT` and `ADMIN_PASSWORD_HASH`.

Do not commit the real password, salt, hash, session secret, or GitHub token into the repository.

## GitHub Token

Create a fine-grained GitHub token with access only to this repository and permission:

```text
Contents: Read and write
```

When you save from the admin panel, the API updates `portfolio/data/content.json` through the GitHub API. Vercel will redeploy automatically if the repository is connected to Vercel.

## Security Notes

- The password is never stored in `admin.js` or any browser file.
- The browser only receives an HttpOnly session cookie after a successful login.
- The GitHub token is only used inside Vercel serverless functions.
- Anyone can view `admin.html`, but they cannot read or save content without a valid session.
