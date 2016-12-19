// appui.js

define([ "jquery", "services", "startupui", "mainui" ],
  function($, Services, StartupController, MainController) {

  function Controller() {
    var self = this;
    self.startupController = new StartupController($("#startup"));
    self.mainController = new MainController($("#app"));
    self.startupState = true;
  }

  function open(self) {
    var startupController = self.startupController;
    var mainController = self.mainController;
    var sessionManager = Services.sessionManager;

    sessionManager.addStateChangeListener(function(sessionManager) {
      if (sessionManager.isLoginRequired()) {
        self.startupState = true;
        startupController.toLoginState();
        startupController.show();
        mainController.setVisible(0);
        mainController.close();
      }
      else if (sessionManager.isActive() && self.startupState) {
        self.startupState = false;
        mainController.open();
        startupController.hide(function() {
          mainController.setVisible(1);
        })
      }
    });

    Services.sessionManager.init();
    return self;
  }

  Controller.prototype = {
    open: function() {
      return open(this);
    }
  }

  return Controller;
});
