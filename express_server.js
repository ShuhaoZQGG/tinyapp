// Import modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const session = require('express-session');
const flash = require('express-flash');
const {users, urlDatabase} = require("./database");
const {generateRandomString, addUser, login} = require("./helper");

 

// Set View Engines
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());
app.use(session({
  secret: 'djhxcvxfgshajfgjhgsjhfgsakjeauytsdfy',
  resave: false,
  saveUninitialized: true
  }));
app.use(flash());




// Define get and post methods
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let {user_id} = req.cookies;
  if (!users[user_id]){
    user_id = false;
  }
  let templateVars = {user_id, urls: urlDatabase};
  if (user_id && user_id != 'false') {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password, urls: urlDatabase };
  }
  
  res.render("urls_index", templateVars);
})


  const templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let {user_id} = req.cookies;
  if (!users[user_id]){
    user_id = false;
  }
  let templateVars = {user_id};
  if (user_id && user_id != false) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/urls');    
  }
});

app.get('/register', (req, res) => {
  const {statusCode, statusMessage} = res;
  const templateVars =  {statusCode, statusMessage};
  res.render('user_registration', templateVars);
})

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  let user_id = addUser(users, email, password);
  let {statusCode, statusMessage} = res
  if ( user_id === "User exists") {
    statusCode = 400;
    statusMessage = "User exists"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    res.cookie("user_id", user_id);
    res.render('user_registration', templateVars)
  } else if (user_id === "Email or Password cannot be empty" ) {
    statusCode = 400;
    statusMessage = "Email or Password cannot be empty"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    res.cookie("user_id", user_id);
    res.render('user_registration', templateVars)
  } else {
    res.cookie("user_id", user_id);
    res.redirect("/urls")
  }
})

app.get("/urls/:shortURL", (req, res) => {
  let {user_id} = req.cookies;
  if (!users[user_id]){
    user_id = false;
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = {user_id, shortURL, longURL}
  if (user_id && user_id != false) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password, shortURL, longURL};
  }

  const username = req.cookies["username"];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {username, shortURL, longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
})

app.get("/login", (req, res) => {
  const {statusCode, statusMessage} = res;
  const templateVars =  {statusCode, statusMessage}
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  let {statusCode, statusMessage} = res;
  const templateVars =  {statusCode, statusMessage}
  let user_id = login(users, email, password);
  if (user_id === "Invalid Account") {
    statusCode = 403;
    statusMessage = "Invalid Account"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    res.cookie("user_id", user_id);
    res.render("user_login", templateVars)
  } else if (user_id === "Invalid Password") {
    statusCode = 403;
    statusMessage = "Invalid Password"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    res.cookie("user_id", user_id);
    res.render("user_login", templateVars)
  } else {
    res.cookie("user_id", user_id);
    res.redirect('/urls');
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

app.post("/login", (req, res) => {
  res.cookie("username",req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});