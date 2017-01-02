var expect = require("chai").expect;
var request = require("request");

describe("App Server", function() {

  describe("index page", function() {
    var url = "http://localhost:4545";

    it("returns status 200", function(done) {
      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("returns HTML content", function(done) {
      request(url, function(error, response, body) {
        expect(response.headers["content-type"]).to.equal("text/html; charset=utf-8");
        done();
      });
    });
  });

  describe("index page with e param", function() {
    var url = "http://localhost:4545/?e=123";

    it("returns redirect status", function(done) {
      request(url, { followRedirect: false }, function(error, response, body) {
        expect(response.statusCode).to.equal(302);
        done();
      });
    });

    it("returns redirect url", function(done) {
      request(url, { followRedirect: false }, function(error, response, body) {
        expect(response.headers["location"]).to.equal("/");
        done();
      });
    });
  });

});
