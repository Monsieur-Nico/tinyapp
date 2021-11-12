function validateCookie(cookieID, users) {
  const user = users[cookieID];
  if (!user) {
    return {data: null, error: "User doesn't exist"};
  }
  return user;
};

function getUserByEmail(users, requestEmail) {
  for (let user in users) {
    if (users[user].email === requestEmail) {
      return users[user];
    }
  }
};

function validateUrls(cookieID, urls) {
  const matchedUrls = {};
  for (let url in urls) {
    if (urls[url].userID === cookieID) {
      matchedUrls[url] = urls[url];
    }
  }
  return matchedUrls;
};

module.exports = {validateCookie, getUserByEmail, validateUrls};