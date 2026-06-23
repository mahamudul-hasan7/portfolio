const { sendJson, verifySession } = require('./_admin-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  return sendJson(res, 200, { authenticated: verifySession(req) });
};
