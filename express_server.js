const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/****************** Objects ******************/
/*********************************************/

const users = {
  "id1": {
    id: "id1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "id2": {
    id: "id2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*********************************************/
/*********************************************/

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const cookieID = req.cookies["user_id"];
  let user;
  if (cookieID) {
    user = validateCookie(cookieID, users);
  }

  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
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

/****************** FUNCTIONS ******************/
/***********************************************/

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = characters.length;
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * length));
  }
  return shortURL;
};

function validateCookie(cookieID, users) {
  const user = users[cookieID];

  return user;
};

function getUserByEmail(users, requestEmail) {

  for (let user in users) {
    if (users[user].email === requestEmail) {
      return users[user];
    }
  }
};