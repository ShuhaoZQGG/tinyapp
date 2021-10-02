// Import modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const cookieSession = require('cookie-session')

const {users, urlDatabase} = require("./database");
const {generateRandomString, addUser, login, addUrl} = require("./helper");

// Set View Engines
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());
app.use(cookieSession({
  name: 'session',
  keys: ["lol xd lmao !@#$", "f**k stFU ^&*()"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// Define get and post methods

/* Home page
   if user loggedin => /urls
   else => /login
*/
app.get("/", (req, res) => {
  let {user_id} = req.session;
  if (!users[user_id] || !user_id){
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});
/* Header for all the pages
   
  If user logged in, they can see their email signed in and they can also log out.

  If user doesn't log in, they will see a warning (suggestion) and they can log in or register.
*/

/* urls page (main page)

   There will always be an example link or demo link that everyone can update or delete to 
   give them a try. However this example like will always reset whenver people login or logout
   in order to advertise lighthouselabs.ca

   They are free to create a new url, update or delete an existing url. 

   They can only update and delete an example link and they cannot create a new link.
*/

app.get('/urls', (req, res) => {
  let {user_id} = req.session;
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

//Go to Create a new link page, if user logged in they can create a new link.
//Otherwise redirect to Login page.
app.get("/urls/new", (req, res) => {
  let {user_id} = req.session;
  if (!users[user_id]){
    user_id = false;
  }
  let templateVars = {user_id};
  if (user_id && user_id != false) {
    const {id, email, password} = users[user_id]
    templateVars = {user_id, id, email, password};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');    
  }
});

// Create a new random short link to access a long (target link)
app.post("/urls", (req, res) => {
  let {user_id} = req.session;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  if (users[user_id]){
    addUrl(urlDatabase, shortURL, longURL, user_id);
    res.redirect(`/urls/${shortURL}`);
  } else {
    let templateVars = {error : "Please Log In!"};
    res.render("error", templateVars)  }
});

//Link for each short URL, User can choose to update or go to the website through short URL 
app.get("/urls/:shortURL", (req, res) => {
  let {user_id} = req.session;
  const shortURL = req.params.shortURL;
  // user can get the example short link
  if (shortURL === "example" && users[user_id]) {
    const longURL = urlDatabase[shortURL].longURL;
    const {id, email} = users[user_id];
    let templateVars = {user_id, id, email, shortURL, longURL};
    res.render("urls_show", templateVars);
  // non-user can also get the example short link
  } else if (shortURL === "example" && !users[user_id]){
    const longURL = urlDatabase[shortURL].longURL;
    user_id = urlDatabase[shortURL].userID;
    let templateVars = {user_id, shortURL, longURL};
    res.render("urls_show", templateVars);
  // Suggest Log In if not yet
  } else if (!users[user_id]){
    user_id = false;
    let templateVars = {error : "Please Log In First"};
    res.render("error", templateVars)
  // Error message if short URL doesn't exist
  } else if (!urlDatabase[shortURL]){
    const templateVars = {error: "The URL does not exist!"}
    res.render("error",templateVars);
  } else if (urlDatabase[shortURL].userID !== user_id){
  // Error message if URl is not bound with the current user
    let templateVars = {error : "This URL does not belong to you!"};
    res.render("error", templateVars)
  // Show long URL, short URL link to the target website and update option
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    let templateVars = {user_id, shortURL, longURL}
    if (user_id && user_id != false) {
      const {id, email} = users[user_id]
      templateVars = {user_id, id, email, shortURL, longURL};
    }
    res.render("urls_show", templateVars);
  } 
});

// Go to the target website through short link
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const { user_id } = req.session;
  let longURL;
  let error;
  let templateVars;
  // Registered User can go the the target website through short URL belonged to them
  if (users[user_id] && urlDatabase[shortURL].userID === user_id) {
    longURL = urlDatabase[shortURL].longURL
    if (longURL.slice(0,7) !== "http://") {
      res.redirect(`http://${longURL}`);
    } else {
      res.redirect(longURL);
    }
  // Both user or guest can go to the target website through example link
  } else if (shortURL === "example") {
    longURL = urlDatabase[shortURL].longURL
    res.redirect(longURL)
  // Error message if user not logged in
  } else if (!users[user_id]) {
    error = "You need to log in!"
    templateVars = {error};
    res.render("error",templateVars);
  // Error message if link non-existing
  } else if (!urlDatabase[shortURL]) {
    error = "The URL does not exist!"
    templateVars = {error}
    res.render("error",templateVars);
  // Error message if User is trying to go through a short URL that does not belong to him/her
  } else if (users[user_id].userID !== user_id && urlDatabase[shortURL]) {
    error = "The URL does not belong to you!"
    templateVars = {error};
    res.render("error",templateVars);
  } 
});

// User can delete short URL that they saved
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  let {user_id} = req.session;
  let error;
  let templateVars
  // Both user and guest can delete example URL
  if (shortURL === "example") {
    user_id =  urlDatabase[shortURL].userID;
    urlDatabase[shortURL] = null;
    res.redirect("/urls");
  // Error message if user not logged in
  } else if (!users[user_id]) {
    error = 'Please Log In First!'
    templateVars = {error};
    res.render('error',templateVars)
  // Error message if link non existing
  } else if (!urlDatabase[shortURL]) {
    error = "The URL does not Exist!"
    templateVars = {error};
    res.render('error',templateVars)
  // Error message if an user tries to delete a link that does not belong to him/her
  } else if (urlDatabase[shortURL].userID !== user_id) {
    error = "This URL doesn't belong to you!"
    templateVars = {error};
    res.render('error',templateVars)
  // An user can delete a short URL that he/sher owns
  } else if (urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } 
})

// User can update the short URL they saved
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  let {user_id} = req.session;
  let error;
  let templateVars
  // Both user and guest can update an example URL
  if (shortURL === "example") {
    user_id =  urlDatabase[shortURL].userID;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/${shortURL}`);
  // Error message if user not logged in
  } else if (!users[user_id]) {
    error = 'Please Log In First!'
    templateVars = {error};
    res.render('error',templateVars)
  // Error message if link non existing
  } else if (!urlDatabase[shortURL]) {
    error = "The URL does not Exist!"
    templateVars = {error};
    res.render('error',templateVars)
  // Error message if an user tries to update a link that does not belong to him/her
  } else if (urlDatabase[shortURL].userID !== user_id) {
    error = "This URL doesn't belong to you!"
    templateVars = {error};
    res.render('error',templateVars)
  // An user can update a short URL that he/sher owns
  } else if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/`);
  }  
})

// New User Registration Page
app.get('/register', (req, res) => {
  const {statusCode, statusMessage} = res;
  const templateVars =  {statusCode, statusMessage};
  res.render('user_registration', templateVars);
})

app.post('/register', (req, res) => {
  let {email, password} = req.body;
  // helper function to add a new user with given userDb, email, password 
  // it also verify if the id (account) exists or not for registration purpose 
  let user_id = addUser(users, email, password); 
  let {statusCode, statusMessage} = res
  // Error message if a user tries to register an existing account
  if ( user_id === "User exists") {
    statusCode = 400;
    statusMessage = "User exists"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    req.session.user_id = user_id;
    res.render('user_registration', templateVars)
  // Error message if email or password entered is empty
  } else if (user_id === "Email or Password cannot be empty" ) {
    statusCode = 400;
    statusMessage = "Email or Password cannot be empty"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    req.session.user_id = user_id;
    res.render('user_registration', templateVars)
  // Reset example link if it has been updated
  } else if (urlDatabase.example) {
    req.session.user_id = user_id;
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
    res.redirect("/urls")
  // Reset example link if it has been deleted
  }  else if (!urlDatabase.example) {
    urlDatabase.example = {};
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
    res.redirect('/urls');
  }
})

// Existing User Registration Page
app.get("/login", (req, res) => {
  const {statusCode, statusMessage} = res;
  const templateVars =  {statusCode, statusMessage}
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let {statusCode, statusMessage} = res;
  let user_id = login(users, email, password);
  if (user_id === "Invalid Account") { 
  // Error Message if the account doesn't exist
    statusCode = 403;
    statusMessage = "Invalid Account"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    req.session.user_id = user_id;
    res.render("user_login", templateVars)
  } else if (user_id === "Invalid Password") {
  // Error Message if the password isn't correct
    statusCode = 403;
    statusMessage = "Invalid Password"
    const templateVars =  {statusCode, statusMessage}
    user_id = false;
    req.session.user_id = user_id;
    res.render("user_login", templateVars)
  } else if (urlDatabase.example) {
  // Reset the example link whenevr User logged in to advertise LHL (if it's updated)
    req.session.user_id = user_id;
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
    res.redirect('/urls');
  } else if (!urlDatabase.example) {
  // Reset the example link whenevr User logged in to advertise LHL (if it's deleted)
    urlDatabase.example = {};
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
    res.redirect('/urls');
  }
})

// User log out 
app.post("/logout", (req, res) => {
  req.session = null;
  // reset example link after log out if it has been updated
  if (urlDatabase.example){
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
  // reset example link after log out if it has been deleted
  } else {
    urlDatabase.example = {};
    urlDatabase.example.longURL = "https://www.lighthouselabs.ca/"
    urlDatabase.example.userID = "default";
  }
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});