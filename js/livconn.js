// livconn.js
// Living Connections main module
//
define([ "jquery", "bootui", "bootproc" ], function($, bootui, bootproc) {

  function renderBootUi() {
    bootui.render();
  }

  function startBootAnimation() {
    var bootAnimation = new bootui.Animation();
    bootAnimation.start();
    return bootAnimation;
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
    $("body").css("backgroundColor", "white");
  }

  // At module load time:
  renderBootUi();

  return function() {
    var bootAnimation = startBootAnimation();
    startBootProcess()
      .done(function() { bootAnimation.stop(); })
      .done(eraseBootUi)
      .done(showApp);
  }
});
