const crypto = require('crypto');
const {
  readJsonBody,
  requireAdmin,
  sendJson,
  verifyPassword
} = require('./_admin-utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  try {
    const body = await readJsonBody(req);
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!verifyPassword(currentPassword)) {
      return sendJson(res, 401, { error: 'Current password is incorrect' });
    }
    if (newPassword.length < 12) {
      return sendJson(res, 400, { error: 'New password must be at least 12 characters' });
    }
    if (currentPassword === newPassword) {
      return sendJson(res, 400, { error: 'New password must be different from current password' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
    const sessionSecret = crypto.randomBytes(48).toString('hex');

    return sendJson(res, 200, {
      ok: true,
      env: {
        ADMIN_PASSWORD_SALT: salt,
        ADMIN_PASSWORD_HASH: hash,
        ADMIN_SESSION_SECRET: sessionSecret
      },
      note: 'Set these values in Vercel Environment Variables and redeploy. The new password becomes active after redeploy.'
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Password change failed' });
  }
};
