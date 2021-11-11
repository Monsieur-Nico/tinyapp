function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = characters.length;
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * length));
  }
  return shortURL;
};

module.exports = {generateRandomString};