var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Profile API", function(client) {

  var theUser;

  beforeEach(function(done) {
    client.makeRequest("POST", "/api/profile").asRoot().withData({
      assetId: 1,
      name: "James"
    }).getJson().then(function(user) {
      expect(user.assetId).to.equal(1);
      expect(user.name).to.equal("James");
      theUser = user;
      done();
    })
    .catch(done);
  });

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("GET", "/api/profile").go()
      .then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    });

    it("returns 404 for missing ID", function(done) {
      client.makeRequest("GET", "/api/profile").asUser(6100).go()
      .then(function(expector) {
        expector.expectStatusCode(404);
        done();
      })
      .catch(done);
    })

    it("retrieves user", function(done) {
      client.makeRequest("GET", "/api/profile").asUser(theUser.id).getJson()
      .then(function(user) {
        expect(user.assetId).to.equal(theUser.assetId);
        expect(user.name).to.equal(theUser.name);
        done();
      })
      .catch(done);
    })
  });

  describe("put method", function() {

    var messageId;

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("PUT", "/api/profile").go()
      .then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    });

    it("returns 404 for bad id", function(done) {
      client.makeRequest("PUT", "/api/profile").asUser(theUser.id + 1).go()
      .then(function(expector) {
        expector.expectStatusCode(404);
        done();
      })
      .catch(done);
    })

    it("permits change in assetId", function(done) {
      client.makeRequest("PUT", "/api/profile").asUser(theUser.id).withData({
        assetId: 2
      }).getJson()
      .then(function(user) {
        expect(user.assetId).to.equal(2);
        done();
      })
      .catch(done);
    })

    it("permits change in name", function(done) {
      client.makeRequest("PUT", "/api/profile").asUser(theUser.id).withData({
        name: "Fred"
      }).getJson()
      .then(function(user) {
        expect(user.name).to.equal("Fred");
        done();
      })
      .catch(done);
    })
  });
});
