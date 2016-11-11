// livconn.js
// Living Connections main module
//
define([ "jquery", "bootui", "bootproc" ], function($, bootui, bootproc) {

  function renderBootUi() {
    bootui.render();
  }

  function eraseBootUi() {
    bootui.erase();
  }

  function startBootAnimation() {
    var bootAnimation = new bootui.Animation();
    bootAnimation.start();
    return bootAnimation;
  }

  function startBootProcess() {
    var bootProcess = new bootproc.BootProcess();
    return bootProcess.start();
  }

  function showMessage(msg) {
    $("body")
      .css("backgroundColor", "white")
      .append($("<div>").text(msg));
  }

  function showApp() {
    eraseBootUi();
    showMessage("Started");
  }

  function formatError(e) {
    return e.toString();
  }

  function showError(e) {
    eraseBootUi();
    showMessage(formatError(e));
  }

  // At module load time:
  renderBootUi();

  return function() {
    var bootAnimation = startBootAnimation();
    startBootProcess()
      .always(function() { bootAnimation.stop(); })
      .done(showApp)
      .catch(showError);
  }
});
