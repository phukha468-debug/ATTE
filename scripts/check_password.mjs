import { createHmac } from 'crypto';

const tgId = 5930269100;
const oldToken = '8622551131:AAHEqPEwg8YdR-XbovgqZ8unF3VpKu68ypc';
const newToken = '8622551131:AAExbMrcwqLeej_j3vLlACSjs0MWu9HlQpo';

function getUserPassword(botToken, tgId) {
  return createHmac('sha256', botToken).update(`shadow_pw_${tgId}`).digest('hex');
}

const oldPwd = getUserPassword(oldToken, tgId);
const newPwd = getUserPassword(newToken, tgId);

console.log('old token password:', oldPwd.slice(0, 20) + '...');
console.log('new token password:', newPwd.slice(0, 20) + '...');
console.log('passwords match:', oldPwd === newPwd);
