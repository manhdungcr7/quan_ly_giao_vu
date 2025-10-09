const bcrypt = require('bcryptjs');

const hash = '$2a$10$un.76fACOofY6/Iyrdi80OO0YsvTLv9fdrcTrSgjLlbCJTdaA6S4q';
const plain = 'Admin@123';

bcrypt.compare(plain, hash).then(res => {
  console.log('Password match:', res);
}).catch(err => {
  console.error('Error comparing:', err);
});
