// appui.js

define([ "jquery", "services", "loginui",      "mainui",      "waitanim", "ui/index" ],
function($,        Services,   LoginComponent, MainComponent, WaitAnim,   ui) {

  var NO_VID =
    "Sorry, this browser is not capable of sending and receiving Living Connections videograms.";

  var CANT_CONNECT =
    "We're not able to connect to Living Connections' server at this time.  " +
    "We'll keep trying. In the meantime, please check your internet connection."

  function selectUnder() {
    return $("#startup .under");
  }

  return function() {

    var components = [
      new ui.Component($("#startup")),
      new LoginComponent($("#login")).setVisible(false),
      new MainComponent($("#app")).setVisible(false)
    ];
    var current = 0;
    var fadeGoal = new ui.FadeGoal();
    var waitAnim = new WaitAnim(selectUnder());

    function show(componentIndex, msg) {
      if (componentIndex != current) {
        components[current].close();
        fadeGoal.addGoal(components[current], 0);
        fadeGoal.addGoal(components[componentIndex], 1);
        components[componentIndex].open();
        current = componentIndex;
      }
      selectUnder().text(msg || "");
      waitAnim.stop();
    }

    function handleSessionStateChange(sessionManager) {
      if (sessionManager.isUnresponsive()) {
        show(0, CANT_CONNECT);
      }
      else if (sessionManager.isLoginRequired()) {
        show(1);
      }
      else if (sessionManager.isActive()) {
        show(2);
      }
      else if (sessionManager.waiting) {
        waitAnim.start();
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
        show(0, NO_VID);
      }
    }
  }
});
