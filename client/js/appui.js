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

    var STARTUP = "startup";
    var LOGIN = "login";
    var APP = "app";

    var carton = new ui.Carton($("#content"), {
      noAppend: true,
      goalType: ui.FadeGoal,
      initialState: STARTUP
    })
    carton.addCompartment(STARTUP, new ui.Component($("#startup")));
    carton.addCompartment(LOGIN, new LoginComponent($("#login")));
    carton.addCompartment(APP, new MainComponent($("#app")));

    var waitAnim = new WaitAnim(selectUnder());

    function show(state, msg) {
      carton.show(state);
      selectUnder().text(msg || "");
      waitAnim.stop();
    }

    function handleSessionStateChange(sessionManager) {
      if (sessionManager.isUnresponsive()) {
        show(STARTUP, CANT_CONNECT);
      }
      else if (sessionManager.isLoginRequired()) {
        show(LOGIN);
      }
      else if (sessionManager.isActive()) {
        show(APP);
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
      carton.open();
      if (Services.videoService.isCapable()) {
        startSession();
      }
      else {
        show(STARTUP, NO_VID);
      }
    }
  }
});
