import { createHmac } from 'crypto';

const botToken = '8622551131:AAHEqPEwg8YdR-XbovgqZ8unF3VpKu68ypc';
const receivedHash = '15e85321a134eb0b9a1a5a2a9325878f296f39d065b1eb6a588f6a878c044f59';

// Exact DCS from base64 (decoded = backslashes in photo_url)
const b64 = 'YXV0aF9kYXRlPTE3NzYxODk3NjQKY2hhdF9pbnN0YW5jZT0tMjQwMzkyNzU2NTUzMDIxNDUzNwpjaGF0X3R5cGU9Z3JvdXAKdXNlcj17ImlkIjo1OTMwMjY5MTAwLCJmaXJzdF9uYW1lIjoiYWthIiwibGFzdF9uYW1lIjoiRHViYWtpIiwidXNlcm5hbWUiOiJCaXpiZXppdCIsImxhbmd1YWdlX2NvZGUiOiJydSIsImlzX3ByZW1pdW0iOnRydWUsImFsbG93c193cml0ZV90b19wbSI6dHJ1ZSwicGhvdG9fdXJsIjoiaHR0cHM6XC9cL3QubWVcL2lcL3VzZXJwaWNcLzMyMFwvanA2ZDRhVkJBMmlRbEdIa2xsYk9tbnhicThzWGdxcC1sbFU2WlhWRGt3YzFlYnlTNkdXOVA3NkUyeVdkZVQ1ci5zdmcifQ==';
const dcsDecoded = Buffer.from(b64, 'base64').toString('utf-8');

// Same DCS but with plain slashes (// instead of \/)
const dcsPlain = dcsDecoded.replace(/\\\//g, '/');

// Same DCS but fully replace user= value with re-encoded version
// Reconstruct: user value with %5C%2F instead of \/
const dcsRawEncoded = dcsDecoded.replace(/\\\//g, '%5C%2F');

function compute(dcs) {
  const sk = createHmac('sha256', 'WebAppData').update(botToken).digest();
  return createHmac('sha256', sk).update(dcs).digest('hex');
}

const tests = [
  ['decoded (\\/ in photo_url)',       dcsDecoded],
  ['plain (// in photo_url)',           dcsPlain],
  ['raw-encoded (%5C%2F in photo_url)', dcsRawEncoded],
];

console.log('received:', receivedHash, '\n');
for (const [label, dcs] of tests) {
  const h = compute(dcs);
  const ok = h === receivedHash ? '✓ MATCH' : '✗';
  console.log(`${ok} ${label}`);
  console.log(`     ${h}`);
}

// Also show char codes around photo_url in dcsDecoded
const idx = dcsDecoded.indexOf('https:');
console.log('\nDecoded photo_url chars:', JSON.stringify(dcsDecoded.slice(idx, idx + 12)));
console.log('Plain   photo_url chars:', JSON.stringify(dcsPlain.slice(idx, idx + 12)));
