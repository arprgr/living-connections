// livconn.js
// Living Connections main module
//
define([ "jquery", "bootui", "bootproc", "error" ], function($, bootui, bootproc, error) {

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

  function renderError(e) {
    return error.render(e);
  }

  function showMessage(html) {
    $("body")
      .css("backgroundColor", "white")
      .append($("<div>").html(html));
  }

  function showApp() {
    eraseBootUi();
    showMessage("<p>Started</p>");
  }

  function showError(e) {
    eraseBootUi();
    showMessage(error.render(e));
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
