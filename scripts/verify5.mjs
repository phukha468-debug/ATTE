import { createHmac } from 'crypto';

const newToken = '8622551131:AAExbMrcwqLeej_j3vLlACSjs0MWu9HlQpo';
const b64 = 'YXV0aF9kYXRlPTE3NzYxODk3NjQKY2hhdF9pbnN0YW5jZT0tMjQwMzkyNzU2NTUzMDIxNDUzNwpjaGF0X3R5cGU9Z3JvdXAKdXNlcj17ImlkIjo1OTMwMjY5MTAwLCJmaXJzdF9uYW1lIjoiYWthIiwibGFzdF9uYW1lIjoiRHViYWtpIiwidXNlcm5hbWUiOiJCaXpiZXppdCIsImxhbmd1YWdlX2NvZGUiOiJydSIsImlzX3ByZW1pdW0iOnRydWUsImFsbG93c193cml0ZV90b19wbSI6dHJ1ZSwicGhvdG9fdXJsIjoiaHR0cHM6XC9cL3QubWVcL2lcL3VzZXJwaWNcLzMyMFwvanA2ZDRhVkJBMmlRbEdIa2xsYk9tbnhicThzWGdxcC1sbFU2WlhWRGt3YzFlYnlTNkdXOVA3NkUyeVdkZVQ1ci5zdmcifQ==';
const receivedHash = '15e85321a134eb0b9a1a5a2a9325878f296f39d065b1eb6a588f6a878c044f59';

const dcs = Buffer.from(b64, 'base64').toString('utf-8');
const sk = createHmac('sha256', 'WebAppData').update(newToken).digest();
const calc = createHmac('sha256', sk).update(dcs).digest('hex');

console.log('received  :', receivedHash);
console.log('calculated:', calc);
console.log('match (old request):', calc === receivedHash);
console.log('\nNote: hash changes per request — old hash was signed with OLD token.');
console.log('New token length:', newToken.length);
