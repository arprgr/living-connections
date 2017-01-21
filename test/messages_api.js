var expect = require("chai").expect;
var request = require("request");
var fs = require("fs");

describe("Messages API", function() {
  var url = "http://localhost:4545/api/messages";

  var rootKey = fs.readFileSync("tmp/adminKey");
  var authHeaders = {
    "X-Access-Key": rootKey
  }

  // Clean up.
  before(function(done) {
    request({
      method: "DELETE",
      url: url,
      headers: authHeaders
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
        headers: authHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("retrieves message", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders,
        form: {
          assetId: 1,
          toUserId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var id = JSON.parse(body).id;
        request({
          method: "GET",
          url: url + "/" + id,
          headers: authHeaders
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(body).assetId).to.equal(1);
          expect(JSON.parse(body).toUserId).to.equal(1);
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
        headers: authHeaders,
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
        headers: authHeaders,
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
        headers: authHeaders,
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
        headers: authHeaders,
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

    before(function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders,
        form: {
          assetId: 1,
          toUserId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).assetId).to.equal(1);
        messageId = JSON.parse(body).id;
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
        headers: authHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("permits change in assetId", function(done) {
      request({
        method: "PUT",
        url: url + "/" + messageId,
        headers: authHeaders,
        form: {
          assetId: 2
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(body).assetId).to.equal(2);
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
        headers: authHeaders
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    })

    it("deletes message", function(done) {
      request({
        method: "POST",
        url: url,
        headers: authHeaders,
        form: {
          assetId: 1,
          toUserId: 1
        }
      }, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        var id = JSON.parse(body).id;
        request({
          method: "DELETE",
          url: url + "/" + id,
          headers: authHeaders
        }, function(error, response, body) {
          expect(response.statusCode).to.equal(200);
          request({
            method: "GET",
            url: url + "/" + id,
            headers: authHeaders
          }, function(error, response, body) {
            expect(response.statusCode).to.equal(404);
            done();
          });
        });
      });
    })
  });
});
