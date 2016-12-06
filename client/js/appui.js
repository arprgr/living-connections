// appui.js

define([ "startupui", "mainui" ], function(startupui, mainui) {

  function Controller(sessionManager) {
    var self = this;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.startupController = new startupui.Controller(sessionManager);
    self.mainController = new mainui.Controller(sessionManager);
  }

  function toLoginState(self) {
    self.startupController.toLoginState();
    self.startupController.showUi();
    self.mainController.showOrHide(0);
    self.mainController.close();
    self.active = false;
  }

  function toMainState(self) {
    self.startupController.toBareState();
    self.startupController.hideUi();
    self.mainController.open();
    self.mainController.showOrHide(1);
    self.active = true;
  }

  function handleSessionManagerStateChange(sessionManager) {
    var self = this;
    if (sessionManager.isLoginRequired()) {
      toLoginState(self);
    }
    else if (sessionManager.isActive()) {
      toMainState(self);
    }
  }

  return {
    Controller: Controller
  }
});
