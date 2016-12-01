// appui.js

define([ "startupui", "listingui" ], function(startupui, listingui) {

  function Controller(sessionManager) {
    var self = this;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.startupController = new startupui.Controller(sessionManager);
    self.listingController = new listingui.Controller(sessionManager);
  }

  function toLoginState(self) {
    self.startupController.toLoginState();
    self.startupController.showUi();
    self.listingController.hideUi();
    self.active = false;
  }

  function toListingState(self) {
    self.startupController.toBareState();
    self.startupController.hideUi();
    self.listingController.showUi();
    self.active = true;
  }

  function handleSessionManagerStateChange(sessionManager) {
    var self = this;
    if (sessionManager.isLoginRequired()) {
      toLoginState(self);
    }
    else if (sessionManager.isActive()) {
      toListingState(self);
    }
  }

  return {
    Controller: Controller
  }
});
