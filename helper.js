const bcrypt = require("bcryptjs");

// generate a string with 6 random characters
const generateRandomString = function() {
  return (Math.random()*1e9).toString(36).slice(0,6);
}

// Check if an user has access to the URL 
const userAccess = function(urlDb, userId) {
  for (const shortUrl in urlDb) {
    if (urlDb[shortUrl].userID === userId) {
      return urlDb[shortUrl];
    }
  }
  return false;
}

// Add a new short URL to the URL database
const addUrl = function(urlDb, shortUrl, longUrl, userId) {
  urlDb[shortUrl] = {};
  urlDb[shortUrl].longURL = longUrl;
  urlDb[shortUrl].userID = userId;
}

// Look up the email (account) in the User Database
const userFound = function(userDb, email) {
  for (const user in userDb) {
    if (userDb[user].email === email) {
      return userDb[user];
    }
  }
  return false;
}

// Add a new User into User database and return its id
const addUser = function(userDb, email, password) {
  if (userFound(userDb, email)) {
    return "User exists";
  } else if (email === '' || password === '') {
    return "Email or Password cannot be empty";
  } else {
    let hashedPassword = bcrypt.hashSync(password, 10);
    let id = generateRandomString();
    userDb[id] = {};
    let userId = userDb[id];
    userId.id = id;
    userId.email = email;
    userId.password = hashedPassword;
    return id;
  }
}

// Determine if an user can successfully log in
const login = function(userDb, email, password) {
  if (!userFound(userDb, email)) {
    return "Invalid Account";
  } else if (!bcrypt.compareSync(password, userFound(userDb, email).password)) {
    return 'Invalid Password'
  } else {
    return userFound(userDb, email).id;
  }
}

module.exports = {
  userFound,
  generateRandomString,
  addUser,
  login,
  userAccess,
  addUrl
}