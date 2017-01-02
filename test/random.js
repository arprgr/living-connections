var expect = require("chai").expect;
var random = require("../server/util/random");

describe("Randomizer", function() {
  describe("digits method", function() {
    it("produces a string", function() {
      var result = random.digits(1);
      expect(typeof result).to.equal("string");
    });
    it("respects the length parameter", function() {
      for (var i = 0; i < 12; ++i) {
        expect(random.digits(i).length).to.equal(i);
      }
    });
  });
  describe("id method", function() {
    it("produces a string of length 32", function() {
      expect(random.id().length).to.equal(32);
    });
    it("is pretty random", function() {
      var lastId = "";
      for (var i = 0; i < 100; ++i) {
        var id = random.id();
        expect(id).not.to.equal(lastId);
        lastId = id;
      }
    });
  });
});
