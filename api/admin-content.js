const {
  getContent,
  readJsonBody,
  requireAdmin,
  saveContent,
  sendJson,
  validateContent
} = require('./_admin-utils');

module.exports = async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      return sendJson(res, 200, { content: await getContent() });
    }

    if (req.method === 'PUT') {
      const body = await readJsonBody(req);
      const content = validateContent(body.content);
      const result = await saveContent(content);
      return sendJson(res, 200, { ok: true, ...result });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Content request failed' });
  }
};
