# Security Checklist

Current hardening in this portfolio:

- The admin dashboard and every admin API endpoint are removed from the deployment.
- Portfolio content is loaded from the static `portfolio/data/content.json` file.
- HTTPS/HSTS, clickjacking, MIME-sniffing, referrer, permissions, and Content Security Policy headers are configured in `vercel.json`.
- API responses are non-cacheable, non-indexable, same-origin resources with a restrictive API-specific CSP.
- The contact endpoint accepts only same-origin JSON requests with a 16 KB body limit.
- Contact submissions use input length limits, email validation, a honeypot, a minimum-fill-time check, and local plus optional persistent rate limiting.
- Dynamic content rendering uses `textContent` and DOM methods instead of untrusted HTML insertion.
- Supabase Row Level Security is enabled with no public table policies; only the server-side service-role key can store messages.

Production environment variables:

```text
SITE_ORIGIN=https://mahamud.xyz
CONTACT_WEBHOOK_URL=private_delivery_webhook

# Optional: store contact messages and enable persistent rate limiting
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server_only_secret
IP_HASH_SECRET=random_32_byte_or_longer_secret
```

At least one contact delivery method must be configured: `CONTACT_WEBHOOK_URL` or Supabase storage.

Production rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `CONTACT_WEBHOOK_URL`, or `IP_HASH_SECRET` in frontend files or variables prefixed with `NEXT_PUBLIC_`/`VITE_`.
- Keep the Supabase service-role key server-side and keep public RLS policies disabled for contact and rate-limit tables.
- Rotate the webhook, service-role key, and IP hash secret if leakage is suspected.
- Do not restore admin routes without a new authentication and authorization review.
- Avoid publishing phone numbers, home addresses, student IDs, dates of birth, or family details in portfolio content.

Remaining optional upgrades:

- Move inline scripts/styles into external files and remove `'unsafe-inline'` from the static-page CSP.
- Add Cloudflare Turnstile or another privacy-respecting challenge if contact spam increases.
- Periodically review and delete old contact messages from Supabase according to a retention policy.
