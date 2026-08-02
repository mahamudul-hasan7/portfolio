# Deployment

The production target is Vercel. Deploy from the repository root; deploying only `portfolio/` excludes the contact API and the root security configuration.

## GitHub Actions secrets

Configure these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Pushes to `main` run validation and then deploy the production build. Deployment can also be started manually from GitHub Actions.

## Local checks

```bash
npm run check
npm run serve
```

Use `vercel dev` when the `/api/contact` endpoint must be tested locally.

## Environment variables

At least one delivery method is required for the contact form:

```text
SITE_ORIGIN=https://mahamud.xyz
CONTACT_WEBHOOK_URL=private_delivery_webhook

# Optional persistent storage and rate limiting
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server_only_secret
IP_HASH_SECRET=random_32_byte_or_longer_secret
```
