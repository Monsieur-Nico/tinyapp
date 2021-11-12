/**
 * ==========================TO DO LIST==========================
 * todo 1. Comment all the important parts of the code.
 * !    2. Refactor the security of the app like seen in lecture
 * !       of w3d4 (Francis lecture).
 * todo 3. Fix all the pages UI.
 */

/****************** Helpers ******************/
const { generateRandomString } = require('./Helpers/stringGenerator');
const { validateCookie, getUserByEmail, validateUrls } = require('./Helpers/validationHelpers');
/*********************************************/

/***************** Constants *****************/
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080; // default port 8080
/*********************************************/

/****************** Objects ******************/
const { users, urlDatabase } = require('./Data/userData');
/*********************************************/

/********* set the view engine to ejs *********/
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['sldnvsdl', 'askdvbsdjkf']
}))
/*********************************************/

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const cookieID = req.session.user_id;
  let user;
  let urls;
  if (cookieID) {
    // Assign the user object to a var
    user = validateCookie(cookieID, users);

    // Assign the matched URLS object to a var
    urls = validateUrls(cookieID, urlDatabase);

    const templateVars = { user, urls: urls };
    res.render("urls_index", templateVars);
  }
  res.redirect("/urls_loggedOut");
});

app.get("/urls_loggedOut", (req, res) => {
  const cookieID = req.session.user_id;
  let user;
  let urls;
  if (cookieID) {
    // Assign the user object to a var
    user = validateCookie(cookieID, users);

    // Assign the matched URLS object to a var
    urls = validateUrls(cookieID, urlDatabase);
  }
  const templateVars = { user, urls: urls };
  res.render("urls_loggedOut", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.session.user_id;
  let user;
  if (cookieID) {
    // Like I said before assigning the user object to a var
    user = validateCookie(cookieID, users);

    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const cookieID = req.session.user_id;

  // If there's no cookie let the user login first
  if (!cookieID) {
    res.send("Please login first!");
    return;
  }
  const short = generateRandomString();
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${short}`);
});

app.get("/u/:shortURL", (req, res) => {

  // Check if the short URL exists
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("This URL does not exist");
  }
  // Extract the longURL
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieID = req.session.user_id;
  let user;

  // Checking if the URL exists
  if (!urlDatabase[req.params.shortURL]) {
    res.send("sorry that shortURL does not exist");
    return;
  }

  // If the user is logged in then display the URLs
  if (cookieID) {
    user = validateCookie(cookieID, users);
    const templateVars = { user, shortURL: req.params.shortURL, urls: urlDatabase };
    res.render("urls_show", templateVars);
  }
  res.redirect("/urls_loggedOut");
});

app.post("/urls/:shortURL/", (req, res) => {
  const cookieID = req.session.user_id;
  if (!cookieID) {
    return res.send('Please login first!');
  }

  // Check if the user has the permissions make changes
  if (!validateCookie(cookieID, users)) {
    return res.send('You don\'t have the permissions to modify this URL');
  };

  // If the user has the permissions, modify the longURL
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieID = req.session.user_id;
  if (!cookieID) {
    return res.send('Please login first!');
  }

  // Check if the user has the permissions to delete URLs
  if (!validateCookie(cookieID, users)) {
    return res.send('You don\'t have the permissions to modify this URL');
  };

  // If the user has permissions, delete the URL
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Get the user from the helper function
  const foundUser = getUserByEmail(users, email);

  // Check if the user exists, if not throw an error
  if (!foundUser) {
    res.status(403);
    res.send("User not found");
    return;
  }

  // Check if the password entered matches database.
  if (!bcrypt.compareSync(password, foundUser.password)) {
    res.status(403);
    res.send("Incorrect password");
    return;
  }

  // Create cookies
  req.session.user_id = foundUser.id;
  req.session.user_password = foundUser.password;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  // Delete all cookies when logging out
  delete req.session.user_id;
  delete req.session.user_password;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const cookieID = req.session.user_id;
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  // Generate new ID
  const newId = generateRandomString();

  // Extract email and password from request body
  const email = req.body.email;
  const password = req.body.password;

  // Handle email and password errors
  if (!email || !password) {
    res.status(400);
    res.send("Invalid input!");
    return;
  }

  const user = getUserByEmail(users, email);

  // Handle duplicate accounts
  if (user) {
    res.status(400);
    res.send("This email is already in use.");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create new object for the new user
  const userObject = {
    id: newId,
    email,
    password: hashedPassword
  };

  // Push the new Object to database
  users[newId] = userObject;
  req.session.user_id = newId;
  req.session.user_password = hashedPassword;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});