import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const contactHandler = require('../api/contact.js');

function invoke(request) {
  return new Promise((resolve, reject) => {
    const responseState = { status: 0, headers: {}, body: null };
    const response = {
      writeHead(status, headers) {
        responseState.status = status;
        responseState.headers = headers;
      },
      end(body) {
        responseState.body = body ? JSON.parse(body) : null;
        resolve(responseState);
      }
    };

    Promise.resolve(contactHandler(request, response)).catch(reject);
  });
}

const methodResponse = await invoke({ method: 'GET', headers: {}, socket: {} });
assert.equal(methodResponse.status, 405);
assert.equal(methodResponse.headers['X-Content-Type-Options'], 'nosniff');
assert.equal(methodResponse.headers['X-Frame-Options'], 'DENY');
assert.equal(methodResponse.headers['Cache-Control'], 'no-store');

const originResponse = await invoke({
  method: 'POST',
  headers: { origin: 'https://attacker.example', 'content-type': 'application/json' },
  socket: {}
});
assert.equal(originResponse.status, 403);
assert.equal(originResponse.body.error, 'Forbidden origin');

console.log('Contact API security smoke tests passed.');
