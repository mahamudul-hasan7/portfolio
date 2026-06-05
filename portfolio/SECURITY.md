Security recommendations for deploying the portfolio

High-level guidance

- Do not expose email addresses in client-side code. Route contact form submissions through a server-side endpoint (serverless function, backend API) that sends mail using an SMTP provider or transactional email service. This prevents harvesting and abuse.
- Add server-set security headers via your hosting/CDN (Netlify, Cloudflare Pages, Vercel, Apache, Nginx):
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: no-referrer-when-downgrade (or strict-origin-when-cross-origin)
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Content-Security-Policy: enforce a CSP (see example below)

Example Content-Security-Policy (modify to match your hosting and external CDNs):

Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none';

Notes:
- Prefer avoiding 'unsafe-inline' by moving inline scripts/styles to external files and using nonces or hashes. For a simple static site you may initially allow 'unsafe-inline' but plan to remove it.
- Limit connect-src to only the endpoints you need (your serverless endpoint, analytics, etc.).

Form handling checklist

- Use server-side validation and escaping for all fields (name, email, message).
- Implement a honeypot field (done) and server-side rate limiting / CAPTCHA if spam persists.
- Return minimal error information to the client to avoid leaking internal details.

Other recommendations

- Enable HTTPS and HSTS at the host.
- Ensure third-party assets (fonts, analytics) are loaded only from trusted origins.
- Replace direct third-party form endpoints with your own proxy or a native host form feature when possible.
- Audit any dynamic HTML insertion and use textContent or DOM methods (we fixed tooltip innerHTML).
- Review external links for rel="noopener noreferrer" when using target="_blank".

If you want, I can:
- Add example Netlify `_headers` rules or Cloudflare Pages header config. (I added `/_headers` in this repo.)
- If you're deploying the static site on Netlify, the contact form can use Netlify Forms and does not need a third-party email endpoint.
