var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");

describe("Profile API", function() {
  var url = "http://localhost:4545/api/profile";

  var rootKey = fs.readFileSync("tmp/adminKey");

  function authHeaders(userId) {
    return {
      "X-Access-Key": rootKey,
      "X-Effective-User": userId
    }
  }

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "GET",
        url: url
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for missing ID", function(done) {
      request({
        method: "GET",
        url: url,
        headers: authHeaders(6000)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("retrieves user", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(0),
        form: {
          assetId: 1,
          name: "James"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var userId = JSON.parse(body).id;
        request({
          method: "GET",
          url: url,
          headers: authHeaders(userId)
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).assetId).to.equal(1);
          expect(JSON.parse(body).name).to.equal("James");
          request({
            method: "DELETE",
            url: url,
            headers: authHeaders(userId)
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
          })
        });
      });
    })
  });

  describe("put method", function() {

    var messageId;

    it("is inaccessible without authorization", function(done) {
      request({
        method: "PUT",
        url: url
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for bad id", function(done) {
      request({
        method: "PUT",
        url: url,
        headers: authHeaders(6000)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("permits change in assetId", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(0),
        form: {
          assetId: 1,
          name: "James"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var userId = JSON.parse(body).id;
        request({
          method: "PUT",
          url: url,
          headers: authHeaders(userId),
          form: {
            assetId: 2
          }
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).assetId).to.equal(2);
          request({
            method: "DELETE",
            url: url,
            headers: authHeaders(userId)
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });
      });
    })

    it("permits change in name", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(0),
        form: {
          assetId: 1,
          name: "James"
        }
      }, function(error, response, body) {
        var userId = JSON.parse(body).id;
        request({
          method: "PUT",
          url: url,
          headers: authHeaders(userId),
          form: {
            name: "Fred"
          }
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).name).to.equal("Fred");
          request({
            method: "DELETE",
            url: url,
            headers: authHeaders(userId)
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });
      });
    })
  });

  describe("delete method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "DELETE",
        url: url
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("deletes user", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders(0),
        form: {
          name: "James"
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var userId = JSON.parse(body).id;
        request({
          method: "DELETE",
          url: url,
          headers: authHeaders(userId)
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          request({
            method: "GET",
            url: url,
            headers: authHeaders(userId)
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
          });
        });
      });
    });
  });
});
