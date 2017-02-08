var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");

var URL = "http://localhost:4546";

describe("Invites API", function() {
  var url = URL + "/api/invites";
  var wipeUrl = URL + "/admin/wipe";

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

  // Clean up.
  before(function(done) {
    request({
      method: "GET",
      url: wipeUrl,
      headers: rootHeaders()
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "GET",
        url: url + "/1"
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for missing ID", function(done) {
      request({
        method: "GET",
        url: url + "/1",
        headers: authHeaders(1)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("retrieves invite", function(done) {
      var fromUserId = 4;
      var email = "test@example.com";
      request({
        method: "POST",
        url: url,
        headers: authHeaders(fromUserId),
        form: {
          assetId: 3,
          email: email
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var id = JSON.parse(body).id;
        request({
          method: "GET",
          url: url + "/" + id,
          headers: authHeaders(fromUserId)
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).fromUserId).to.equal(fromUserId);
          expect(JSON.parse(body).email).to.equal(email);
          done();
        });
      });
    })

    it("allows only the creator to view invite", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(1),
        form: {
          assetId: 1,
          email: "test@example.com"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var id = JSON.parse(body).id;
        request({
          method: "GET",
          url: url + "/" + id,
          headers: authHeaders(2)
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(401);
          done();
        });
      });
    })
  });

  describe("post method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "POST",
        url: url
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("is accessible with root authorization", function(done) {
      request({
        method: "POST",
        url: url,
        headers: rootHeaders(),
        form: {
          assetId: 1,
          email: "test@example.com"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    })
  });

  describe("put method", function() {

    var inviteId;
    var userId = 5;

    before(function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(userId),
        form: {
          assetId: 1,
          email: "test@example.com"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        inviteId = JSON.parse(body).id;
        done();
      });
    });

    it("is inaccessible without authorization", function(done) {
      request({
        method: "PUT",
        url: url + "/1"
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for bad id", function(done) {
      request({
        method: "PUT",
        url: url + "/1111111111",
        headers: authHeaders(userId)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("rejects change in email", function(done) {
      request({
        method: "PUT",
        url: url + "/" + inviteId,
        form: {
          email: "fred"
        },
        headers: authHeaders(userId)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(500);
        done();
      });
    })

    it("permits change in assetId", function(done) {
      request({
        method: "PUT",
        url: url + "/" + inviteId,
        form: {
          assetId: 2
        },
        headers: authHeaders(userId)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).message.assetId).to.equal(2);
        done();
      });
    })
  })

  describe("delete method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "DELETE",
        url: url + "/1"
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for missing ID", function(done) {
      request({
        method: "DELETE",
        url: url + "/1",
        headers: authHeaders(1)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("deletes message", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(3),
        form: {
          assetId: 1,
          email: "test@example.com"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var id = JSON.parse(body).id;
        request({
          method: "DELETE",
          url: url + "/" + id,
          headers: authHeaders(3)
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          request({
            method: "GET",
            url: url + "/" + id,
            headers: authHeaders(3)
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
          });
        });
      });
    })
  });
});
