// appui.js

define([ "services", "startupui", "mainui" ], function(Services, StartupController, MainController) {

  function toLoginState(self) {
    self.startupController.toLoginState();
    self.startupController.showUi();
    self.mainController.setVisible(0);
    self.mainController.close();
  }

  function toMainState(self) {
    self.startupController.toBareState();
    self.startupController.hideUi();
    self.mainController.open();
    self.mainController.setVisible(1);
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

  function Controller() {
    var self = this;
    self.startupController = new StartupController();
    self.mainController = new MainController();
    Services.sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
  }

  Controller.prototype = {
    open: function() {
      Services.sessionManager.init();
    }
  }

  return Controller;
});
