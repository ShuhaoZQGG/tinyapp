const { assert } = require('chai');

const { userFound } = require('../helper.js');

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
    const user = userFound(testUsers, "user@example.com", )
    const expectedOutput = testUsers["userRandomID"];
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });

  it('should return false if the user email is not foun', function(){
    const user = userFound(testUsers, "use3r@example.com", )
    const expectedOutput = false;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  })
});