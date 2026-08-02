# Security

## Current controls

- No admin dashboard or admin API is deployed.
- Static content is loaded from `portfolio/data/content.json` with DOM APIs and `textContent`.
- Vercel applies HSTS, clickjacking, MIME-sniffing, referrer, permissions, and Content Security Policy headers.
- The contact API accepts same-origin JSON only, enforces a 16 KB body limit, validates fields, uses a honeypot and fill-time check, and applies local plus optional persistent rate limiting.
- Supabase Row Level Security is enabled with no public policies; only the server-side service-role key can store messages.

## Secret handling

Never expose these values in frontend files or public environment variables:

- `CONTACT_WEBHOOK_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `IP_HASH_SECRET`

Rotate secrets immediately if disclosure is suspected. Keep contact data only as long as operationally necessary.

## Public information

The CV intentionally publishes approved professional contact information. Do not add student IDs, dates of birth, family details, authentication credentials, or a full residential address.

## Future hardening

- Move remaining inline page styles and startup script into external files, then remove `'unsafe-inline'` from the static-page CSP.
- Add a privacy-respecting challenge such as Cloudflare Turnstile only if spam becomes material.
- Review dependencies and Vercel environment variables before each production release.
