var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Invites API", function(client) {
  const PATH = "/api/invites";

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("GET", PATH + "/1").expectStatusCode(401).go()
      .then(function() { done(); })
      .catch(done);
    });

    it("returns 404 for missing ID", function(done) {
      client.makeRequest("GET", PATH + "/1").asUser(1).expectStatusCode(404).go()
      .then(function() { done(); })
      .catch(done);
    })

    it("retrieves invite", function(done) {
      const fromUserId = 4;
      const assetId = 3;
      const email = "test@example.com";
      client.makeRequest("POST", PATH).asUser(fromUserId).withData({
        assetId: assetId,
        email: email
      }).expectStatusCode(200).getJson().go()
      .then(function(invite) {
        return client.makeRequest("GET", PATH + "/" + invite.id)
        .asUser(fromUserId).expectStatusCode(200).getJson().go()
        .then(function(invite) {
          expect(invite.fromUserId).to.equal(fromUserId);
          expect(invite.assetId).to.equal(assetId);
          expect(invite.email).to.equal(email);
          done();
        });
      })
      .catch(done);
    })

    it("allows only the creator to view invite", function(done) {
      var fromUserId = 4;
      client.makeRequest("POST", PATH).asUser(fromUserId).withData({
        assetId: 3,
        email: "bob@dobbs.com"
      }).expectStatusCode(200).getJson().go()
      .then(function(invite) {
        client.makeRequest("GET", PATH + "/" + invite.id).asUser(fromUserId + 1).expectStatusCode(401).go()
        .then(function() {
          done();
        });
      })
      .catch(done);
    })
  });

  describe("post method", function() {

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("POST", PATH).withData({
        assetId: 3,
        email: "bob@dobbs.com"
      }).expectStatusCode(401).go()
      .then(function() { done(); })
      .catch(done);
    });
  });

  describe("put method", function() {

    var invite;
    var userId = 5;
    var assetId = 3;
    var email = "bob@dobbs.com";

    beforeEach(function(done) {
      client.makeRequest("POST", PATH).asUser(userId).withData({
        assetId: assetId,
        email: email
      }).expectStatusCode(200).getJson().go()
      .then(function(_invite) {
        invite = _invite;
        done();
      })
      .catch(done);
    });

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("PUT", PATH + "/" + invite.id).expectStatusCode(401).go()
      .then(function() { done(); })
      .catch(done);
    });

    it("returns 404 for bad id", function(done) {
      client.makeRequest("PUT", PATH + "/" + invite.id + "111").asRoot().expectStatusCode(404).go()
      .then(function() { done(); })
      .catch(done);
    })

    it("rejects change to email", function(done) {
      client.makeRequest("PUT", PATH + "/" + invite.id).asUser(userId).withData({
        email: "jr_" + email
      }).expectStatusCode(500).go()
      .then(function() { done(); })
      .catch(done);
    })

    it("permits change to assetId", function(done) {
      client.makeRequest("PUT", PATH + "/" + invite.id).asUser(userId).withData({
        assetId: assetId + 1
      }).expectStatusCode(200).getJson().go()
      .then(function(newInvite) {
        expect(newInvite.id).to.equal(invite.id);
        expect(newInvite.fromUserId).to.equal(userId);
        expect(newInvite.assetId).to.equal(assetId + 1);
        expect(newInvite.email).to.equal(email);
        done();
      })
      .catch(done);
    })
  })

  describe("delete method", function() {

    it("is inaccessible without authorization", function(done) {
      done();
    });

    it("returns 404 for missing ID", function(done) {
      done();
    })

    it("deletes message", function(done) {
      done();
    })
  });
});
