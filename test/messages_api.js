const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Messages API", function(client) {

  describe("get method", function() {

    var fromUserId = 3;

    var seedProperties = {
      assetId: 5,
      toUserId: 4,
      type: 1
    };

    var goodMessageId;

    beforeEach(function(done) {
      client.makeRequest("POST", "/api/messages").asUser(fromUserId).withData(seedProperties) 
      .getJson()
      .then(function(message) {
        goodMessageId = message.id;
        done();
      })
      .catch(done);
    });

    function get(id) {
      return client.makeRequest("GET", "/api/messages/" + id);
    }

    it("is inaccessible without authorization", function(done) {
      get(goodMessageId).go()
      .then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    });

    it("allows root to retrieve message", function(done) {
      get(goodMessageId).asRoot().getJson()
      .then(function(message) {
        expect(message.assetId).to.equal(seedProperties.assetId);
        expect(message.toUserId).to.equal(seedProperties.toUserId);
        done();
      })
      .catch(done);
    })

    it("returns 404 for missing ID", function(done) {
      get(goodMessageId*2 + 1).asRoot().go()
      .then(function(expector) {
        expector.expectStatusCode(404);
        done();
      })
      .catch(done);
    })

    it("does not permit just anyone to retrieve message", function(done) {
      get(goodMessageId).asUser(fromUserId * 2).go()
      .then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    })

    it("allows sender to retrieve message", function(done) {
      get(goodMessageId).asUser(fromUserId).getJson()
      .then(function(message) {
        expect(message.assetId).to.equal(seedProperties.assetId);
        expect(message.toUserId).to.equal(seedProperties.toUserId);
        done();
      })
      .catch(done);
    });
  });

  describe("post method", function() {

    function post(data) {
      return client.makeRequest("POST", "/api/messages").withData(data);
    }

    it("is inaccessible without authorization", function(done) {
      post({}).go().then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    });

    it("defaults to greeting type", function(done) {
      post({
        assetId: 1,
        toUserId: 1
      }).asUser(12).getJson()
      .then(function(message) {
        expect(message.type).to.equal(0);
        done();
      })
      .catch(done);
    })

    it("requires recipient for greeting type", function(done) {
      post({
        type: 0,
        assetId: 1
      }).asUser(12).go().then(function(expector) {
        expector.expectStatusCode(500);
        expect(expector.getJson().toUserId).to.equal("?");
        done();
      })
      .catch(done);
    })

    it("ordinary users may not post announcements", function(done) {
      post({
        type: 3,
        assetId: 1
      }).asUser(12).go().then(function(expector) {
        expector.expectStatusCode(401);
        done();
      })
      .catch(done);
    })
  });

  /********

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
        expect(message.assetId).to.equal(seedProperties.assetId + 1);
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

  *******/
});
