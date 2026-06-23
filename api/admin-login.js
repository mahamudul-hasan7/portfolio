const {
  createSessionCookie,
  readJsonBody,
  sendJson,
  verifyPassword
} = require('./_admin-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    if (!verifyPassword(String(body.password || ''))) {
      return sendJson(res, 401, { error: 'Invalid password' });
    }

    return sendJson(res, 200, { ok: true }, {
      'Set-Cookie': createSessionCookie()
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Login failed' });
  }
};
