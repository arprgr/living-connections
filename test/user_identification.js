var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("User identification", function(client) {

  // Methods...

  function createUser(name, level) {
    return client.makeRequest("POST", "/api/users")
    .withData({
      name: name,
      level: level
    })
    .asRoot().getJson();
  }

  function createEmailProfile(userId, email) {
    return client.makeRequest("POST", "/api/emailprofiles")
    .withData({
      userId: userId,
      email: email
    })
    .asRoot().getJson();
  }

  function fetchActionList(userId) {
    return client.makeRequest("GET", "/a").asUser(userId).getJson();
  }

  // Tests...

  it("includes user name", function(done) {
    const NAME = "Josephine";
    createUser(NAME)
    .then(function(user) {
      return fetchActionList(user.id);
    })
    .then(function(actionResponse) {
      expect(actionResponse.user).to.exist;
      expect(actionResponse.user.name).to.equal(NAME);
      expect(actionResponse.user.email).to.not.exist;
      done();
    })
    .catch(done);
  });

  it("includes email if present", function(done) {
    const EMAIL = "test@example.com";
    createUser("Edwin")
    .then(function(user) {
      return createEmailProfile(user.id, EMAIL);
    })
    .then(function(emailProfile) {
      return fetchActionList(emailProfile.userId);
    })
    .then(function(actionResponse) {
      expect(actionResponse.user).to.exist;
      expect(actionResponse.user.email).to.equal(EMAIL);
      done();
    })
    .catch(done);
  });
});

