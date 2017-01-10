// appui.js

define([ "jquery", "services", "startupui", "mainui", "crossfade" ],
  function($, Services, StartupComponent, MainComponent, CrossFade) {

  return function() {

    var startupComponent = new StartupComponent($("#startup"));
    var mainComponent = new MainComponent($("#app")).setVisible(false);
    var mainShowing = false;

    function handleSessionStateChange(sessionManager) {
      if (sessionManager.isLoginRequired()) {
        startupComponent.toLoginState();
        if (mainShowing) {
          mainComponent.close();
          new CrossFade(mainComponent, startupComponent).run();
          mainShowing = false;
        }
      }
      else if (sessionManager.isActive() && !mainShowing) {
        mainComponent.open();
        new CrossFade(startupComponent, mainComponent).run();
        mainShowing = true;
      }
    }

    this.open = function() {
      var sessionManager = Services.sessionManager;
      sessionManager.addStateChangeListener(handleSessionStateChange);
      sessionManager.init();
    }
  }
});
