const bcrypt = require('bcrypt');

bcrypt.hash('Password@123', 12).then(hash => {
  console.log('New hash:', hash);
});