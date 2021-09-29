const { users } = require('./database')
// generate a string with 6 random characters

const generateRandomString = function() {
  return (Math.random()*1e9).toString(36).slice(0,6);
}

const userFound = function(userDb, email) {
  for (const user in userDb) {
    if (userDb[user].email === email) {
      return true;
    }
  }
  return false;
}

const addUser = function(userDb, email, password) {
  if (userFound(userDb, email)) {
    return "error: user exists";
  } else {
    let id = generateRandomString();
    userDb[id] = {};
    let userId = userDb[id];
    userId.id = id;
    userId.email = email;
    userId.password = password;
    return id;
  }
}

module.exports = {
  generateRandomString,
  addUser
}