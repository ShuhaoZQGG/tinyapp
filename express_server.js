// Import modules
const express = require("express");
const app = express();
const PORT = 8081; // default port 8080
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const {users, urlDatabase} = require("./database");
const {generateRandomString, addUser} = require("./helper");

// Set View Engines
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

// Define get and post methods
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const {user_id} = req.cookies;
  let templateVars = {user_id, urls: urlDatabase};
  if (user_id) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password, urls: urlDatabase };
  }
  
  res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const {user_id} = req.cookies;
  let templateVars = {user_id};
  if (user_id) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password};
  }
  res.render("urls_new", templateVars);
});

app.get('/register', (req, res) => {
  res.render("user_registration");
})

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const user_id = addUser(users, email, password)
  res.cookie("user_id", user_id);
  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  const {user_id} = req.cookies;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = {user_id, shortURL, longURL}
  if (user_id) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password, shortURL, longURL};
  }
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

app.post("/login", (req, res) => {
  res.cookie("username",req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});