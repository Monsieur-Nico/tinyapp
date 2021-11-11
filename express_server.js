/**
 * ==========================TO DO LIST==========================
 * todo 1. Comment all the important parts of the code.
 * !    2. Refactor the security of the app like seen in lecture
 * !       of w3d4 (Francis lecture).
 * todo 3. Fix all the pages UI.
 */

/****************** Helpers ******************/
const {generateRandomString} = require('./Helpers/stringGenerator');
const {validateCookie, getUserByEmail, validateUrls} = require('./Helpers/validationHelpers');
/*********************************************/

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

/****************** Objects ******************/
const {users, urlDatabase} = require('./Data/userData');
/*********************************************/

/********* set the view engine to ejs *********/
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
/*********************************************/

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  let urls;
  if (cookieID) {
    user = validateCookie(cookieID, users);
    urls = validateUrls(cookieID, urlDatabase);
  }

  const templateVars = { user, urls: urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  if (!cookieID) {
    res.send("Please login first!");
    return;
  }
  const short = generateRandomString();
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${short}`);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("This URL does not exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (!urlDatabase[req.params.shortURL]) {
    res.send("sorry that shortURL does not exist");
    return;
  }
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user, shortURL: req.params.shortURL, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const foundUser = getUserByEmail(users, email);
  if (!foundUser) {
    res.status(403);
    res.send("User not found");
    return;
  }
  
  if (foundUser.password !== password) {
    res.status(403);
    res.send("Incorrect password");
    return;
  }

  res.cookie('user_id', foundUser.id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  const userObject = {
    id: newId,
    email: email,
    password: password
  };

  if (!email || !password) {
    res.status(400);
    res.send("Invalid input!");
    return;
  }

  const user = getUserByEmail(users, email)
  if (user) {
    res.status(400);
    res.send("This email is already in use.");
    return;
  }

  users[newId] = userObject;
  res.cookie("user_id", newId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});