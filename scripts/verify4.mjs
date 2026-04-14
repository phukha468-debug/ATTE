import { createHmac } from 'crypto';

const botToken = '8622551131:AAHEqPEwg8YdR-XbovgqZ8unF3VpKu68ypc';
const receivedHash = '15e85321a134eb0b9a1a5a2a9325878f296f39d065b1eb6a588f6a878c044f59';
const b64 = 'YXV0aF9kYXRlPTE3NzYxODk3NjQKY2hhdF9pbnN0YW5jZT0tMjQwMzkyNzU2NTUzMDIxNDUzNwpjaGF0X3R5cGU9Z3JvdXAKdXNlcj17ImlkIjo1OTMwMjY5MTAwLCJmaXJzdF9uYW1lIjoiYWthIiwibGFzdF9uYW1lIjoiRHViYWtpIiwidXNlcm5hbWUiOiJCaXpiZXppdCIsImxhbmd1YWdlX2NvZGUiOiJydSIsImlzX3ByZW1pdW0iOnRydWUsImFsbG93c193cml0ZV90b19wbSI6dHJ1ZSwicGhvdG9fdXJsIjoiaHR0cHM6XC9cL3QubWVcL2lcL3VzZXJwaWNcLzMyMFwvanA2ZDRhVkJBMmlRbEdIa2xsYk9tbnhicThzWGdxcC1sbFU2WlhWRGt3YzFlYnlTNkdXOVA3NkUyeVdkZVQ1ci5zdmcifQ==';
const dcs = Buffer.from(b64, 'base64').toString('utf-8');
const dcsPlain = dcs.replace(/\\\//g, '/');

console.log('received:', receivedHash, '\n');

const tests = [
  // Current algorithm variants
  ['A: HMAC(WebAppData→token) decoded \\/',  () => { const sk = createHmac('sha256','WebAppData').update(botToken).digest(); return createHmac('sha256',sk).update(dcs).digest('hex'); }],
  ['B: HMAC(WebAppData→token) plain //',     () => { const sk = createHmac('sha256','WebAppData').update(botToken).digest(); return createHmac('sha256',sk).update(dcsPlain).digest('hex'); }],
  // Reversed key derivation
  ['C: HMAC(token→WebAppData) decoded \\/',  () => { const sk = createHmac('sha256',botToken).update('WebAppData').digest(); return createHmac('sha256',sk).update(dcs).digest('hex'); }],
  ['D: HMAC(token→WebAppData) plain //',     () => { const sk = createHmac('sha256',botToken).update('WebAppData').digest(); return createHmac('sha256',sk).update(dcsPlain).digest('hex'); }],
  // Direct HMAC (no key derivation)
  ['E: HMAC(token) directly decoded \\/',    () => createHmac('sha256',botToken).update(dcs).digest('hex')],
  ['F: HMAC(token) directly plain //',       () => createHmac('sha256',botToken).update(dcsPlain).digest('hex')],
  // Bot secret only (after colon)
  ['G: HMAC(secret part only) decoded',      () => { const secret = botToken.split(':')[1]; const sk = createHmac('sha256','WebAppData').update(secret).digest(); return createHmac('sha256',sk).update(dcs).digest('hex'); }],
];

for (const [label, fn] of tests) {
  const h = fn();
  console.log(`${h === receivedHash ? '✓ MATCH' : '✗      '} ${label}`);
  if (h === receivedHash) console.log('  >>>', h);
}
