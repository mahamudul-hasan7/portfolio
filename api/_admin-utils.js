const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const COOKIE_NAME = 'rakib_admin_session';
const CONTENT_PATH = 'portfolio/data/content.json';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((cookies, item) => {
    const index = item.indexOf('=');
    if (index === -1) return cookies;
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

function createSessionCookie() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }

  const payload = {
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  };
  const body = base64url(JSON.stringify(payload));
  const signature = sign(body, secret);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(`${body}.${signature}`)}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Strict${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secure}`;
}

function verifySession(req) {
  const secret = getSessionSecret();
  if (!secret) return false;

  const token = parseCookies(req)[COOKIE_NAME];
  if (!token || !token.includes('.')) return false;

  const [body, signature] = token.split('.');
  const expected = sign(body, secret);
  const sigBuffer = Buffer.from(signature || '');
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.role === 'admin' && payload.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function verifyPassword(password) {
  const salt = process.env.ADMIN_PASSWORD_SALT || '';
  const hash = process.env.ADMIN_PASSWORD_HASH || '';
  if (!salt || !hash || !password) return false;

  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const derivedBuffer = Buffer.from(derived);
  const hashBuffer = Buffer.from(hash);
  return derivedBuffer.length === hashBuffer.length && crypto.timingSafeEqual(derivedBuffer, hashBuffer);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024 * 2) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
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
    ...headers
  });
  res.end(JSON.stringify(data));
}

function requireAdmin(req, res) {
  if (verifySession(req)) return true;
  sendJson(res, 401, { error: 'Unauthorized' });
  return false;
}

function repoConfig() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    contentPath: process.env.CONTENT_PATH || CONTENT_PATH
  };
}

async function githubRequest(url, options = {}) {
  const { token } = repoConfig();
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || `GitHub request failed with ${response.status}`);
  }
  return data;
}

async function getContentFromGitHub() {
  const { repo, branch, contentPath } = repoConfig();
  const url = `https://api.github.com/repos/${repo}/contents/${contentPath}?ref=${encodeURIComponent(branch)}`;
  const data = await githubRequest(url);
  return {
    content: JSON.parse(Buffer.from(data.content || '', 'base64').toString('utf8')),
    sha: data.sha
  };
}

async function saveContentToGitHub(content) {
  const { repo, branch, contentPath } = repoConfig();
  const current = await getContentFromGitHub();
  const url = `https://api.github.com/repos/${repo}/contents/${contentPath}`;
  await githubRequest(url, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Update portfolio content from admin panel',
      content: Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64'),
      sha: current.sha,
      branch
    })
  });
}

function localContentFile() {
  return path.join(process.cwd(), CONTENT_PATH);
}

async function getContent() {
  const { token, repo } = repoConfig();
  if (token && repo) {
    return (await getContentFromGitHub()).content;
  }
  return JSON.parse(fs.readFileSync(localContentFile(), 'utf8'));
}

async function saveContent(content) {
  const { token, repo } = repoConfig();
  if (token && repo) {
    await saveContentToGitHub(content);
    return { persisted: 'github' };
  }

  if (process.env.VERCEL) {
    throw new Error('GitHub persistence is not configured');
  }

  fs.writeFileSync(localContentFile(), JSON.stringify(content, null, 2) + '\n');
  return { persisted: 'local' };
}

function validateContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new Error('Content must be an object');
  }
  const listFields = ['projects', 'blogs', 'skills', 'journey'];
  for (const field of listFields) {
    if (content[field] && !Array.isArray(content[field])) {
      throw new Error(`${field} must be a list`);
    }
  }
  return content;
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  getContent,
  readJsonBody,
  requireAdmin,
  saveContent,
  sendJson,
  validateContent,
  verifyPassword,
  verifySession
};
