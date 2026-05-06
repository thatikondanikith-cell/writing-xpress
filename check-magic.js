const fs = require('fs');
const buffer = fs.readFileSync('public/uploads/logo.jpg').slice(0, 8);
console.log(buffer.toString('hex'));
