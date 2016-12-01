// appui.js

define([ "jquery", "session", "startupui", "listingui", "vid" ], function($, session, startupui, listingui, vid) {

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(function() {
      self.handleSessionManagerStateChange();
    });
    self.startupController = new startupui.Controller(sessionManager);
    self.listingController = new listingui.Controller(sessionManager);
  }

  Controller.prototype = {
    handleSessionManagerStateChange: function() {}
  }

  return {
    Controller: Controller
  }
});
