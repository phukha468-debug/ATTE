const { createHmac } = require('crypto');

const botToken = '8622551131:AAHEqPEwg8YdR-XbovgqZ8unF3VpKu68ypc';
const receivedHash = '2696d9bd6abd5e84d85c16702b27035aa10238ee2c52ec0fd66c717e0697eb71';

// Exact user JSON — with real backslash+slash (\/) in photo_url
const userJSON = '{"id":5930269100,"first_name":"aka","last_name":"Dubaki","username":"Bizbezit","language_code":"ru","is_premium":true,"allows_write_to_pm":true,"photo_url":"https:\\/\\/t.me\\/i\\/userpic\\/320\\/jp6d4aVBA2iQlGHkllbOmnxbq8sXgqp-llU6ZXVDkwc1ebyS6GW9P76E2yWdeT5r.svg"}';

// Same but with plain slashes
const userJSONplain = '{"id":5930269100,"first_name":"aka","last_name":"Dubaki","username":"Bizbezit","language_code":"ru","is_premium":true,"allows_write_to_pm":true,"photo_url":"https://t.me/i/userpic/320/jp6d4aVBA2iQlGHkllbOmnxbq8sXgqp-llU6ZXVDkwc1ebyS6GW9P76E2yWdeT5r.svg"}';

// NOTE: auth_date is different per request — using old value to validate algorithm
const dcs1 = (user) => `auth_date=1776188780\nchat_instance=-2403927565530214537\nchat_type=group\nuser=${user}`;
const dcs2 = (user) => `auth_date=1776189764\nchat_instance=-2403927565530214537\nchat_type=group\nuser=${user}`;

function compute(dcs) {
  const sk = createHmac('sha256', 'WebAppData').update(botToken).digest();
  return createHmac('sha256', sk).update(dcs).digest('hex');
}

console.log('--- Verifying HMAC ---');
console.log('received hash   :', receivedHash);
console.log();

const variants = [
  ['old auth_date + escaped \\/', dcs1(userJSON)],
  ['old auth_date + plain //',    dcs1(userJSONplain)],
  ['new auth_date + escaped \\/', dcs2(userJSON)],
  ['new auth_date + plain //',    dcs2(userJSONplain)],
];

for (const [label, dcs] of variants) {
  const h = compute(dcs);
  console.log(`[${h === receivedHash ? 'MATCH' : '    '}] ${label}`);
  console.log('         calc:', h);
}

// Show actual char codes of photo_url start
console.log();
console.log('userJSON photo_url prefix bytes (https:XX):', [...userJSON].slice(116, 124).map(c => '0x' + c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '));
console.log('userJSONplain prefix bytes (https:XX):',      [...userJSONplain].slice(116, 124).map(c => '0x' + c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '));
