const { assert } = require('chai');

const { getUserByEmail } = require('../Helpers/validationHelpers');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com").id;
    const expectedUserID = 'userRandomID';
    console.log(user, expectedUserID);
    assert.strictEqual(user, expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "users@example.com");
    const expectedUserID = undefined;
    console.log(user, expectedUserID);
    assert.strictEqual(user, expectedUserID);
  });
});