define([ "jquery", "mocha", "chai" ], function($, _m, chai) {
  // chai plays nice with requireJS, mocha does not.

  var initCalled = false;

  function init() {
    if (!initCalled) {
      mocha.ui("bdd");
      mocha.reporter("html");
      window.expect = chai.expect;
      $("body").append($("<div>").attr("id", "mocha"));
    }
  }

  function run() {
    init();
    mocha.run();
  }

  return {
    init: init,
    run: run
  }
})
