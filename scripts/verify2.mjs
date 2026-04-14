import { createHmac } from 'crypto';

const botToken = '8622551131:AAHEqPEwg8YdR-XbovgqZ8unF3VpKu68ypc';
const receivedHash = '15e85321a134eb0b9a1a5a2a9325878f296f39d065b1eb6a588f6a878c044f59';
const b64 = 'YXV0aF9kYXRlPTE3NzYxODk3NjQKY2hhdF9pbnN0YW5jZT0tMjQwMzkyNzU2NTUzMDIxNDUzNwpjaGF0X3R5cGU9Z3JvdXAKdXNlcj17ImlkIjo1OTMwMjY5MTAwLCJmaXJzdF9uYW1lIjoiYWthIiwibGFzdF9uYW1lIjoiRHViYWtpIiwidXNlcm5hbWUiOiJCaXpiZXppdCIsImxhbmd1YWdlX2NvZGUiOiJydSIsImlzX3ByZW1pdW0iOnRydWUsImFsbG93c193cml0ZV90b19wbSI6dHJ1ZSwicGhvdG9fdXJsIjoiaHR0cHM6XC9cL3QubWVcL2lcL3VzZXJwaWNcLzMyMFwvanA2ZDRhVkJBMmlRbEdIa2xsYk9tbnhicThzWGdxcC1sbFU2WlhWRGt3YzFlYnlTNkdXOVA3NkUyeVdkZVQ1ci5zdmcifQ==';

const dcs = Buffer.from(b64, 'base64').toString('utf-8');

console.log('DataCheckString decoded:');
console.log('  first 40 chars:', JSON.stringify(dcs.slice(0, 40)));
console.log('  newlines count:', (dcs.match(/\n/g) || []).length);
console.log('  total length:', dcs.length);

// Check for backslash (char code 92)
const hasBackslash = [...dcs].some(c => c.charCodeAt(0) === 92);
console.log('  has backslash (0x5C):', hasBackslash);

// Show photo_url area
const photoIdx = dcs.indexOf('photo_url');
console.log('  photo_url area:', JSON.stringify(dcs.slice(photoIdx, photoIdx + 40)));

const sk = createHmac('sha256', 'WebAppData').update(botToken).digest();
const calc = createHmac('sha256', sk).update(dcs).digest('hex');

console.log('\nreceived  :', receivedHash);
console.log('calculated:', calc);
console.log('MATCH:', calc === receivedHash);
