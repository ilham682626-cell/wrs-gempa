const crypto = require('crypto');

function secret() {
  return process.env.WRS_ADMIN_SECRET || process.env.ADMIN_SECRET || '';
}
function password() {
  return process.env.WRS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}
function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}
function issue() {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}
function verify(token) {
  if (!secret() || !token) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
function login(input) {
  if (!password() || !secret()) return null;
  return input === password() ? issue() : null;
}
module.exports = { login, verify };
