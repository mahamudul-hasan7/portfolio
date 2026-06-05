// Netlify Function: contact
// Place this file in /netlify/functions/contact.js (already created here).
// This is a scaffold that validates input and demonstrates where to call
// your email service provider (SendGrid, Mailgun, etc.).

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const name = String((payload.name || '')).trim();
  const email = String((payload.email || '')).trim();
  const message = String((payload.message || '')).trim();
  const hp = String((payload._hp || '')).trim(); // honeypot

  // Basic validations
  if (hp) {
    // Honeypot filled -> likely bot. Return 200 to appear successful but drop.
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Basic email sanity check
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRe.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  // At this point, you should forward the message to your email provider.
  // Example (pseudocode):
  // if (process.env.SENDGRID_API_KEY) { call SendGrid API with payload }
  // For safety, this scaffold does not call any external API.

  // If you want the function to actually send emails, implement provider logic here
  // and store API keys in Netlify environment variables (Site settings -> Build & deploy -> Environment).

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Accepted (not sent - configure provider)'}),
  };
};
