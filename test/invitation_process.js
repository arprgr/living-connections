var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");

describe("invitation process", function() {
  var url = "http://localhost:4545/";
  var invitesUrl = url + "api/invites";
  var messagesUrl = url + "api/messages";
  var alphaUrl = url + "a";

  var rootKey = fs.readFileSync("tmp/adminKey");

  function rootHeaders() {
    return {
      "X-Access-Key": rootKey
    }
  }

  function authHeaders(userId) {
    return {
      "X-Access-Key": rootKey,
      "X-Effective-User": userId
    }
  }

  var inviter = 1;
  var assetId = 2;
  var email = "test@example.com";
  var ticketId;
  var ticketExternalId;
  var ticketMessageId;

  beforeEach(function(done) {
    request({
      method: "POST",
      url: invitesUrl,
      form: {
        assetId: assetId,
        email: email
      },
      headers: authHeaders(inviter)
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      ticketId = JSON.parse(body).id;
      ticketExternalId = JSON.parse(body).externalId;
      ticketMessageId = JSON.parse(body).messageId;
      done();
    });
  });

  after(function(done) {
    request({
      method: "DELETE",
      url: messagesUrl,
      headers: rootHeaders(),
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      request({
        method: "DELETE",
        url: invitesUrl,
        headers: rootHeaders()
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  it("creates retrieveable invite", function(done) {
    request({
      method: "GET",
      url: invitesUrl + "/" + ticketId,
      headers: rootHeaders(),
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(body).externalId).to.equal(ticketExternalId);
      expect(JSON.parse(body).fromUserId).to.equal(inviter);
      done();
    });
  });

  it("creates retrieveable message", function(done) {
    request({
      method: "GET",
      url: messagesUrl + "/" + ticketMessageId,
      headers: rootHeaders(),
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(body).assetId).to.equal(assetId);
      expect(JSON.parse(body).fromUserId).to.equal(inviter);
      expect(JSON.parse(body).toUserId).to.be.null;
      done();
    });
  });

  describe("with click on invite link", function() {

    var sessionId;

    beforeEach(function(done) {
      request({
        method: "GET",
        followRedirect: false,
        url: url + "?e=" + ticketExternalId
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(302);
        sessionId = response.headers["set-cookie"][0].match(/s=([a-zA-Z0-9]+);/)[1];
        done();
      });
    });

    it("punches ticket", function(done) {
      request({
        method: "GET",
        url: invitesUrl + "/" + ticketId,
        headers: rootHeaders(),
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).externalId).to.equal(ticketExternalId);
        expect(JSON.parse(body).messageId).to.be.null;
        expect(JSON.parse(body).fromUserId).to.be.null;
        done();
      });
    });

    it("creates user", function(done) {
      request({
        method: "GET",
        url: alphaUrl,
        headers: {
          "cookie": "s=" + sessionId
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).user.name).to.equal(email);
        done();
      });
    });

    it("delivers message", function(done) {
      request({
        method: "GET",
        url: messagesUrl + "/" + ticketMessageId,
        headers: rootHeaders(),
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).toUserId).not.to.be.null;
        done();
      });
    });
  });
});
