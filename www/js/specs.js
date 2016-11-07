// specs.js

define([ "specrunner", "jquery" ], function(specrunner, jq) {

  function writeSpecs() {
    describe("jQuery", function() {

      it("does not pollute the global namespace", function() {
        expect($).to.be.an("undefined");
      });

      it("is a function", function() {
        expect(jq).to.be.a("function");
      });
    });
  }

  return function() {
    specrunner.init();
    writeSpecs();
    specrunner.run();
  }
});
