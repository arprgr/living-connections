// appui.js

define([ "jquery", "services", "loginui",      "mainui",      "ui/index" ],
function($,        Services,   LoginComponent, MainComponent, ui) {

  var NO_VID = "Sorry, this browser is not capable of sending and receiving Living Connections videograms.";

  return function() {

    var components = [
      new ui.Component($("#startup")),
      new LoginComponent($("#login")).setVisible(false),
      new MainComponent($("#app")).setVisible(false)
    ];
    var current = 0;
    var fadeGoal = new ui.FadeGoal();

    function show(componentIndex) {
      if (componentIndex != current) {
        components[current].close();
        fadeGoal.addGoal(components[current], 0);
        fadeGoal.addGoal(components[componentIndex], 1);
        components[componentIndex].open();
        current = componentIndex;
      }
    }

    function handleSessionStateChange(sessionManager) {
      if (sessionManager.isLoginRequired()) {
        show(1);
      }
      else if (sessionManager.isActive()) {
        show(2);
      }
    }

    function startSession() {
      var sessionManager = Services.sessionManager;
      sessionManager.addStateChangeListener(handleSessionStateChange);
      sessionManager.init();
    }

    this.open = function() {
      if (Services.videoService.isCapable()) {
        startSession();
      }
      else {
        $("#startup .under").text(NO_VID);
      }
    }
  }
});
