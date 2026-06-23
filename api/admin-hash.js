const crypto = require('crypto');
const { readJsonBody, sendJson } = require('./_admin-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_HASH_ENDPOINT !== 'true') {
    return sendJson(res, 404, { error: 'Not found' });
  }

  try {
    const body = await readJsonBody(req);
    const password = String(body.password || '');
    if (password.length < 12) {
      return sendJson(res, 400, { error: 'Use at least 12 characters' });
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return sendJson(res, 200, { salt, hash });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Hash generation failed' });
  }
};
