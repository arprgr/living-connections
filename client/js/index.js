// index.js
// Living Connections main module
//
define([ "startupui", "appui", "session" ], function(startupui, appui, session) {

  return function() {
    var sessionManager = new session.Manager();
    new startupui.Controller(sessionManager);
    new appui.Controller(sessionManager);
    sessionManager.init();
  }
});
