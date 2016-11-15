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
    selectMessageBox().text("<p>Why don't you log in.</p>");
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

  function showTimeout(sessionManager) {
    selectMessageBox().text("<p>Failed to initialize.  Refresh page to continue.</p>");
  }

  function showError(e) {
    selectMessageBox().html(error.render(e));
  }

  return function() {
    var sessionManager = new session.Manager();
    var bootAnimation = startBootAnimation();

    setTimeout(function() {
      sessionManager.init()
        .always(function() { bootAnimation.stop(); })
        .done(function() {
          showApp(sessionManager);
        })
        .fail(function() {
          showTimeout(sessionManager);
        })
        .catch(showError);
    }, 2000)
  }
});
