// index.js
// Living Connections main module
//
define([ "appui", "session" ], function(appui, session) {
  return function() {
    new appui.Controller(new session.Manager().init());
  }
});
