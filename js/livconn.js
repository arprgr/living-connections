// livconn.js
// Living Connections main module
//
define([ "jquery", "bootui", "bootproc" ], function($, bootui, bootproc) {

  function renderBootUi() {
    bootui.render();
  }

  function startBootAnimation() {
    bootui.startAnimation();
  }

  function stopBootAnimation() {
    bootui.stopAnimation();
  }

  function eraseBootUi() {
    bootui.erase();
  }

  function startBootProcess() {
    var promise = $.Deferred();
    setTimeout(function() {
      promise.resolve({});
    }, 15000);
    return promise;
  }

  function showApp() {
  }

  // At module load time:
  renderBootUi();

  return function() {
    startBootAnimation();
    startBootProcess()
      .done(stopBootAnimation)
      .done(eraseBootUi)
      .done(showApp);
  }
});
