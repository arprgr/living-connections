// services.js - Services

define([ "session" ], function(SessionManager) {

  // Configuration.

  // Instantiation.
  var sessionManager = new SessionManager();

  // Hookup.

  return {
    sessionManager: sessionManager
  }
});
