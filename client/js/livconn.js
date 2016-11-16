// livconn.js
// Living Connections main module
//
define([ "jquery", "bootui", "session", "error" ], function($, bootui, session, error) {

  function selectStartupScreen() {
    return $(".startupScreen");
  }

  function selectDotsBox() {
    return selectStartupScreen().find(".dots");
  }

  function selectMessageBox() {
    return selectStartupScreen().find(".message");
  }

  function eraseBootUi() {
    selectStartupScreen().empty();
  }

  function startBootAnimation() {
    return new bootui.Animation(selectDotsBox()).start();
  }

  function showLogin(sessionManager) {
    selectMessageBox().html($("<p>").text("Why don't you log in?"));
  }

  function showApp(sessionManager) {
    if (sessionManager.userName) {
      eraseBootUi();
      $("body").append($("<p>").text(sessionManager.userName));
    }
    else {
      showLogin(sessionManager);
    }
  }

  function showError(e) {
    selectMessageBox().html(error.render(e));
  }

  return function() {
    var sessionManager = new session.Manager();
    var bootAnimation = startBootAnimation();
    sessionManager.init()
      .always(function() { bootAnimation.stop(); })
      .done(function() { showApp(sessionManager); })
      .fail(showError);
  }
});
