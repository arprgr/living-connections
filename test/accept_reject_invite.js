var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");
var Promise = require("promise");

var URL = "http://localhost:4546";
var CONNECTIONS_URL = URL + "/api/connections";

describe("Messages API (invitation actions)", function() {

  var adminKey = fs.readFileSync("tmp/adminKey");

  function actionUri(messageId, action) {
    return "/api/messages/" + messageId + "?act=" + action;
  }

  var fromUserId = 3;
  var toUserId = 4;
  var invMessageId;
  var nonInvMessageId;

  beforeEach(function(done) {
    request({
      method: "DELETE",
      url: URL + "/connections",
      headers: {
        "X-Access-Key": adminKey
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      request({
        method: "DELETE",
        url: URL + "/api/messages",
        headers: {
          "X-Access-Key": adminKey
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        request({
          method: "POST",
          url: URL + "/api/messages",
          form: {
            type: 1,  /* invite */
            toUserId: toUserId,
            assetId: 5
          },
          headers: {
            "X-Access-Key": adminKey,
            "X-Effective-User": fromUserId
          }
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          invMessageId = JSON.parse(body).id;
          request({
            method: "POST",
            url: URL + "/api/messages",
            form: {
              type: 0,  /* greeting */
              toUserId: toUserId,
              assetId: 5
            },
            headers: {
              "X-Access-Key": adminKey,
              "X-Effective-User": fromUserId
            }
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            nonInvMessageId = JSON.parse(body).id;
            done();
          })
        })
      })
    })
  });

  it("is ok with accepting an invitation", function(done) {
    request({
      method: "GET",
      url: URL + actionUri(invMessageId, "accept"),
      headers: {
        "X-Access-Key": adminKey,
        "X-Effective-User": toUserId
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      // accepting creates connection.
      request({
        method: "GET",
        url: URL + "/connections/" + fromUserId + "/" + toUserId,
        headers: {
          "X-Access-Key": adminKey,
          "X-Effective-User": fromUserId
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).grade).to.equal(1);
        done();
      })
    });
  });

  it("is not ok with accepting a non-invitation", function(done) {
    request({
      method: "GET",
      url: URL + actionUri(nonInvMessageId, "accept"),
      headers: {
        "X-Access-Key": adminKey,
        "X-Effective-User": toUserId
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it("can accept an invitation twice without trouble", function(done) {
    request({
      method: "GET",
      url: URL + actionUri(invMessageId, "accept"),
      headers: {
        "X-Access-Key": adminKey,
        "X-Effective-User": toUserId
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      request({
        method: "GET",
        url: URL + actionUri(invMessageId, "accept"),
        headers: {
          "X-Access-Key": adminKey,
          "X-Effective-User": toUserId
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        request({
          method: "GET",
          url: URL + "/connections/" + fromUserId + "/" + toUserId,
          headers: {
            "X-Access-Key": adminKey,
            "X-Effective-User": fromUserId
          }
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).grade).to.equal(1);
          done();
        })
      })
    })
  });

  it("is ok with rejecting an invitation", function(done) {
    request({
      method: "GET",
      url: URL + actionUri(invMessageId, "reject"),
      headers: {
        "X-Access-Key": adminKey,
        "X-Effective-User": toUserId
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      // rejecting downgrades connection.
      request({
        method: "GET",
        url: URL + "/connections/" + toUserId + "/" + fromUserId,
        headers: {
          "X-Access-Key": adminKey,
          "X-Effective-User": toUserId
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).grade).to.equal(0);
        done();
      })
    });
  });

  it("fails on bad action", function(done) {
    request({
      method: "GET",
      url: URL + actionUri(invMessageId, "floof"),
      headers: {
        "X-Access-Key": adminKey,
        "X-Effective-User": toUserId
      }
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(500);
      done();
    });
  });
});
