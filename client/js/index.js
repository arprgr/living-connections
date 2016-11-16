// index.js
// Living Connections main module
//
define([ "jquery", "bootui", "session", "error" ], function($, bootui, session, error) {

  function selectStartupScreen() {
    return $(".startup");
  }

  function selectInner() {
    return selectStartupScreen().find(".inner");
  }

  function selectUnderBox() {
    return selectStartupScreen().find(".under");
  }

  function eraseBootUi() {
    selectStartupScreen().empty();
  }

  function startBootAnimation() {
    return new bootui.WaitingAnimation(selectUnderBox()).start();
  }

  function showLogin(sessionManager) {
    selectInner().css("top", -338);
    selectUnderBox()
      .empty()
      .append($("<div>")
        .addClass("login")
        .append($("<div>").text("Log in with your email address:"))
        .append($("<input>").attr("type", "text"))
        .append($("<button>").text("Go!"))
      );
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
    selectUnderBox().empty().html(error.render(e));
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
