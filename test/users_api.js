var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Users API", function(client) {

  const PATH = "/api/users";

  describe("post method", function() {

    it("is inaccessible without authorization", function(done) {
      client.makeRequest("POST", PATH).withData({ name: "Jack" }).expectStatusCode(401).go()
      .then(function() {
        done();
      })
      .catch(done);
    });

    it("is accessible with root authorization", function(done) {
      client.makeRequest("POST", PATH).withData({ name: "Jack" }).asRoot().expectStatusCode(200).go()
      .then(function() {
        done();
      })
      .catch(done);
    });

    it("sets id, name, and default level", function(done) {
      client.makeRequest("POST", PATH).withData({ name: "Jack" }).asRoot().getJson().go()
      .then(function(user) {
        expect(typeof user.id).to.equal("number");
        expect(user.name).to.equal("Jack");
        expect(user.level).to.equal(1);
        done();
      })
      .catch(done);
    })
  });

  describe("get method", function() {

    it("is inaccessible without authorization", function(done) {
      done();
    });

    it("allows root to retrieve", function(done) {
      done();
    })

    it("returns 404 for missing ID", function(done) {
      done();
    })

    it("does not permit just anyone to retrieve user", function(done) {
      done();
    })

    it("allows user to retrieve self", function(done) {
      done();
    });
  });

  describe("put method", function() {

    it("is inaccessible without authorization", function(done) {
      done();
    });

    it("returns 404 for bad id", function(done) {
      done();
    })

    it("permits user to change name", function(done) {
      done();
    })

    it("does not permit just anyone to modify user", function(done) {
      done();
    })

    it("allows root to change level", function(done) {
      done();
    })

    it("does not permit non-root user to change level", function(done) {
      done();
    })
  })

  describe("delete method", function() {

    it("is inaccessible without authorization", function(done) {
      done();
    });

    it("returns 404 for missing ID", function(done) {
      done();
    })

    it("permits root to delete user", function(done) {
      done();
    })

    it("does not permit non-root user to delete self", function(done) {
      done();
    })
  });
});
