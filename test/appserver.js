var expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("App Server", function(client) {

  describe("index page", function() {

    it("returns HTML content", function(done) {
      client.makeRequest("/").go()
      .then(function(expector) {
        expector.expectStatusCode(200);
        expector.expectResponseHeader("content-type", "text/html; charset=utf-8");
        done();
      })
      .catch(done);
    });
  });

  describe("index page with e param", function() {

    it("redirects", function(done) {
      client.makeRequest("/?e=123").go()
      .then(function(expector) {
        expector.expectRedirect("/");
        done();
      });
    });
  });
});
