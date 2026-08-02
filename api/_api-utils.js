const rateLimitBuckets = new Map();
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '');
  return (forwarded.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim().slice(0, 120);
}

function rateLimit(req, res, key, limit, windowMs) {
  const now = Date.now();

  if (rateLimitBuckets.size > 5000) {
    for (const [bucketName, bucketValue] of rateLimitBuckets) {
      if (bucketValue.resetAt <= now) rateLimitBuckets.delete(bucketName);
    }
    while (rateLimitBuckets.size > 5000) {
      rateLimitBuckets.delete(rateLimitBuckets.keys().next().value);
    }
  }

  const bucketKey = `${key}:${clientIp(req)}`;
  const bucket = rateLimitBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  rateLimitBuckets.set(bucketKey, bucket);

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  if (bucket.count > limit) {
    sendJson(res, 429, { error: 'Too many requests. Please try again later.' }, {
      'Retry-After': String(retryAfter)
    });
    return false;
  }

  return true;
}

function addOrigin(values, value) {
  if (!value) return;
  try {
    const url = new URL(String(value));
    if (url.protocol === 'https:' || url.protocol === 'http:') values.add(url.origin);
  } catch (error) {
    // Ignore malformed configuration instead of weakening the origin check.
  }
}

function allowedOrigins(req) {
  const values = new Set(['https://mahamud.xyz', 'https://www.mahamud.xyz']);
  addOrigin(values, process.env.SITE_ORIGIN);

  const host = String(req.headers.host || '').toLowerCase();
  if (/^[a-z0-9-]+\.vercel\.app(?::\d+)?$/.test(host)) addOrigin(values, `https://${host}`);

  if (process.env.NODE_ENV !== 'production') {
    addOrigin(values, host ? `http://${host}` : '');
    addOrigin(values, 'http://localhost:3000');
    addOrigin(values, 'http://localhost:4173');
    addOrigin(values, 'http://127.0.0.1:4173');
  }

  return values;
}

function requireSameOrigin(req, res) {
  if (!MUTATING_METHODS.has(req.method)) return true;
  const origin = String(req.headers.origin || '').replace(/\/$/, '');
  const referer = String(req.headers.referer || '');
  const allowed = allowedOrigins(req);

  if (origin && allowed.has(origin)) return true;
  if (!origin && referer) {
    try {
      if (allowed.has(new URL(referer).origin)) return true;
    } catch (error) {
      // Fall through to the rejection below.
    }
  }

  if (!origin && !referer && process.env.NODE_ENV !== 'production') return true;

  sendJson(res, 403, { error: 'Forbidden origin' });
  return false;
}

function readJsonBody(req, maxBytes = 16 * 1024) {
  return new Promise((resolve, reject) => {
    const declaredLength = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      reject(new Error('Request body is too large'));
      return;
    }

    let body = '';
    let finished = false;
    req.on('data', chunk => {
      if (finished) return;
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > maxBytes) {
        finished = true;
        reject(new Error('Request body is too large'));
      }
    });
    req.on('end', () => {
      if (finished) return;
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...headers
  });
  res.end(JSON.stringify(data));
}

module.exports = {
  clientIp,
  rateLimit,
  readJsonBody,
  requireSameOrigin,
  sendJson
};
