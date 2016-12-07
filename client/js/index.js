// index.js
// Living Connections main module
//
define([ "appui", "session" ], function(AppController, SessionManager) {
  return function() {
    new AppController(new SessionManager().init());
  }
});
