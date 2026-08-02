const crypto = require('crypto');

function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function storageConfig() {
  const rawUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!rawUrl || !key) throw new Error('Contact storage is not configured');

  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
    throw new Error('Contact storage must use HTTPS');
  }

  return { baseUrl: url.origin, key };
}

async function storageRequest(route, options = {}) {
  const { baseUrl, key } = storageConfig();
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (error) {
    data = raw;
  }

  if (!response.ok) throw new Error(`Contact storage request failed with ${response.status}`);
  return data;
}

async function storeMessage(payload) {
  const rows = await storageRequest('/rest/v1/contact_messages', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(payload)
  });
  return rows;
}

async function persistentRateLimit(bucketKey, limit, windowSeconds) {
  if (!storageConfigured()) return null;
  return storageRequest('/rest/v1/rpc/check_rate_limit', {
    method: 'POST',
    body: JSON.stringify({ p_bucket_key: bucketKey, p_limit: limit, p_window_seconds: windowSeconds })
  });
}

function hashIp(ip) {
  const secret = process.env.IP_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'local-contact-rate-limit';
  return crypto.createHmac('sha256', secret).update(String(ip || '')).digest('hex');
}

module.exports = {
  hashIp,
  persistentRateLimit,
  storageConfigured,
  storeMessage
};
