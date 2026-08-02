const { clientIp, rateLimit, readJsonBody, requireSameOrigin, sendJson } = require('./_api-utils');
const { hashIp, persistentRateLimit, storageConfigured, storeMessage } = require('./_contact-store');

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function forwardToWebhook(payload) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL || '';
  if (!webhookUrl) return { delivered: false };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Contact webhook failed with ${response.status}`);
  }

  return { delivered: true };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!requireSameOrigin(req, res)) return;
  if (!rateLimit(req, res, 'contact', 5, 10 * 60 * 1000)) return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return sendJson(res, 415, { error: 'JSON request body required' });
  }

  try {
    const allowed = await persistentRateLimit(`contact:${hashIp(clientIp(req)).slice(0, 32)}`, 8, 60 * 60);
    if (allowed === false) return sendJson(res, 429, { error: 'Too many messages. Please try again later.' }, { 'Retry-After': '3600' });
  } catch (error) {
    // The local limiter still protects the endpoint during a database outage.
  }

  try {
    const body = await readJsonBody(req, 16 * 1024);
    const hp = clean(body.hp || body._hp || body['bot-field'], 200);

    if (hp) {
      return sendJson(res, 200, { ok: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 180);
    const phone = clean(body.phone, 40);
    const subject = clean(body.subject, 180) || 'Portfolio enquiry';
    const message = clean(body.message, 5000);
    const startedAt = Number(body.startedAt || 0);

    if (!name || !email || !message) {
      return sendJson(res, 400, { error: 'Please fill in all fields before sending.' });
    }

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { error: 'Please enter a valid email address.' });
    }

    if (startedAt && (Date.now() - startedAt < 1500 || Date.now() - startedAt > 24 * 60 * 60 * 1000)) {
      return sendJson(res, 400, { error: 'Please refresh the page and try again.' });
    }

    const messagePayload = {
      sender_name: name,
      sender_email: email,
      phone,
      subject,
      message,
      ip_hash: hashIp(clientIp(req)),
      user_agent: clean(req.headers['user-agent'], 300)
    };

    let stored = false;
    if (storageConfigured()) {
      await storeMessage(messagePayload);
      stored = true;
    }

    let delivery = { delivered: false };
    try {
      delivery = await forwardToWebhook({ name, email, phone, subject, message, source: 'portfolio-contact', receivedAt: new Date().toISOString() });
    } catch (error) {
      if (!stored) throw error;
    }

    if (!stored && !delivery.delivered) throw new Error('Contact delivery is not configured');

    return sendJson(res, 200, { ok: true, stored, ...delivery });
  } catch (error) {
    if (error.message === 'Request body is too large') {
      return sendJson(res, 413, { error: 'Request body is too large.' });
    }
    if (error.message === 'Invalid JSON body') {
      return sendJson(res, 400, { error: 'Invalid JSON request body.' });
    }
    if (error.message === 'Contact delivery is not configured') {
      return sendJson(res, 500, { error: 'Contact delivery is not configured yet.' });
    }
    return sendJson(res, 500, { error: 'Message could not be sent right now.' });
  }
};
