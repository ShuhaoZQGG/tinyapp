// Database for long and short urls
/*
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
*/

const urlDatabase = {
  example: {
    longURL: "https://www.lighthouselabs.ca/",
    userID: "default"
  },
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "default"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "default"
  }
};

// Database for user informations (id, email, password)
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

module.exports = {
  urlDatabase,
  users
}