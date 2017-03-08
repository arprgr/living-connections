var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Threads API", function(client) {

  var theUser1, theUser2;

  beforeEach(function(done) {
    client.makeRequest("POST", "/api/profile").asRoot().withData({
      assetId: 1,
      name: "User 1"
    }).getJson().then(function(user) {
      theUser1 = user;
      return client.makeRequest("POST", "/api/profile").asRoot().withData({
        assetId: 2,
        name: "User 2"
      }).getJson();
    }).then(function(user) {
      theUser2 = user;
      done();
    })
    .catch(done);
  });

  function getThread(user1Id, user2Id) {
    return client.makeRequest("GET", "/api/threads/" + user1Id + "/" + user2Id);
  }

  it("is inaccessible without authorization", function(done) {
    getThread(theUser1.id, theUser2.id).go()
    .then(function(expector) {
      expector.expectStatusCode(401);
      done();
    })
    .catch(done);
  });

  it("returns 404 for missing user (1)", function(done) {
    getThread(theUser1.id - 1, theUser2.id).asRoot().go()
    .then(function(expector) {
      expector.expectStatusCode(404);
      done();
    })
    .catch(done);
  })

  it("returns 404 for missing user (2)", function(done) {
    getThread(theUser1.id, theUser2.id + 1).asRoot().go()
    .then(function(expector) {
      expector.expectStatusCode(404);
      done();
    })
    .catch(done);
  })

  it("returns empty array", function(done) {
    getThread(theUser1.id, theUser2.id).asUser(theUser1.id).getJson()
    .then(function(thread) {
      expect(thread.length).to.equal(0);
      done();
    })
    .catch(done);
  })
});
