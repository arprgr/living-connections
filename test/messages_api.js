var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");

var URL = "http://localhost:4546";

describe("Messages API", function() {
  var url = URL + "/api/messages";

  var rootKey = fs.readFileSync("tmp/adminKey");

  var rootHeaders = {
    "X-Access-Key": rootKey
  };

  function authHeaders(userId) {
    return {
      "X-Access-Key": rootKey,
      "X-Effective-User": userId
    }
  }

  var fromUserId = 3;
  var seedProperties = {
    assetId: 5,
    toUserId: 4,
    type: 1
  };
  var goodMessageId;

  // Start fresh each time, with a single message in the table.
  beforeEach(function(done) {
    request({
      method: "DELETE",
      url: url,
      headers: rootHeaders
    }, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      request({
        method: "POST",
        url: url,
        headers: authHeaders(fromUserId),
        form: seedProperties,
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        goodMessageId = JSON.parse(body).id;
        done();
      });
    });
  });

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "GET",
        url: url + "/" + goodMessageId,
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("allows root to retrieve message", function(done) {
      request({
        method: "GET",
        url: url + "/" + goodMessageId,
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).assetId).to.equal(seedProperties.assetId);
        expect(JSON.parse(body).toUserId).to.equal(seedProperties.toUserId);
        done();
      });
    })

    it("returns 404 for missing ID", function(done) {
      request({
        method: "GET",
        url: url + "/" + (goodMessageId - 1),
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("does not permit just anyone to retrieve message", function(done) {
      request({
        method: "GET",
        url: url + "/" + goodMessageId,
        headers: authHeaders(fromUserId + seedProperties.toUserId + 1)
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    })

    it("allows sender to retrieve message", function(done) {
      request({
        method: "GET",
        url: url + "/" + goodMessageId,
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).assetId).to.equal(seedProperties.assetId);
        expect(JSON.parse(body).toUserId).to.equal(seedProperties.toUserId);
        done();
      });
    });
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
        headers: rootHeaders,
        form: {
          type: 0,
          assetId: 1,
          toUserId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    })

    it("defaults to greeting type", function(done) {
      request({
        method: "POST",
        url: url,
        headers: rootHeaders,
        form: {
          assetId: 1,
          toUserId: 1
        }
      }, function(error, response, body) {
        expect(JSON.parse(body).type).to.equal(0);
        done();
      });
    })

    it("requires recipient for greeting type", function(done) {
      request({
        method: "POST",
        url: url,
        headers: rootHeaders,
        form: {
          type: 0,
          assetId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(500);
        expect(body).to.equal('{"toUserId":"?"}');
        done();
      });
    })

    it("defaults start and end date for announcements", function(done) {
      request({
        method: "POST",
        url: url,
        headers: rootHeaders,
        form: {
          type: 3,
          assetId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(typeof JSON.parse(body).startDate).to.equal("string");
        expect(typeof JSON.parse(body).endDate).to.equal("string");
        done();
      });
    })
  });

  describe("put method", function() {

    var messageId;

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
        url: url + "/" + (goodMessageId - 1),
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("permits change in assetId", function(done) {
      request({
        method: "PUT",
        url: url + "/" + goodMessageId,
        headers: rootHeaders,
        form: {
          assetId: seedProperties.assetId + 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).assetId).to.equal(seedProperties.assetId + 1);
        done();
      });
    })
  })

  describe("delete method", function() {

    it("is inaccessible without authorization", function(done) {
      request({
        method: "DELETE",
        url: url + "/" + goodMessageId
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it("returns 404 for missing ID", function(done) {
      request({
        method: "DELETE",
        url: url + "/" + (goodMessageId - 1),
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("deletes message", function(done) {
      request({
        method: "DELETE",
        url: url + "/" + goodMessageId,
        headers: rootHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        request({
          method: "GET",
          url: url + "/" + goodMessageId,
          headers: rootHeaders
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(404);
          done();
        });
      });
    })
  });
});
