// appui.js

define([ "jquery", "services", "startupui", "mainui" ], function($, Services, StartupController, MainController) {

  function selectStartupContainer() {
    return $("#startup");
  }

  function toLoginState(self) {
    self.startupController.toLoginState();
    self.startupController.setVisible(1);
    self.mainController.setVisible(0);
    self.mainController.close();
  }

  function toMainState(self) {
    self.startupController.toBareState();
    self.startupController.setVisible(0);
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
    self.startupController = new StartupController(selectStartupContainer());
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
