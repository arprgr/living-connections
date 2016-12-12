// startupui.js

define([ "jquery", "services", "loginui", "waitanim", "anim", "cookie" ],
  function($, Services, LoginController, WaitAnimController, Animation, Cookie) {

  var NO_VID = "Sorry, but your browser is not capable of sending and receiving Living Connections video messages.";
  var VID_SUPPORT_REF = "Read more about supported browsers.";
  var VID_SUPPORT_URL = "http://recordrtc.org"
  var CONTINUE_ANYWAY = "Continue anyway";

  var CONTINUE_ANYWAY_COOKIE = new Cookie("xd");

  function selectContainer() {
    return $("#startup");
  }

  function selectInner() {
    return $("#startup .inner");
  }

  function selectMessageBox() {
    return $("#startup .message");
  }

  var originalHeight = selectContainer().height();

  var LOGIN_TOP = -338;
  var HEIGHT_REDUX = 290;
  var TRANSITION_PERIOD = 900;

  function showInnerInPosition(part) {
    selectInner().css("top", part * LOGIN_TOP);
    selectContainer().height(originalHeight - (part * HEIGHT_REDUX));
  }

  function showInnerInWaitingPosition() {
    showInnerInPosition(0);
  }

  function showInnerInLoginPosition() {
    showInnerInPosition(1);
  }

  function showLoginForm(self) {
    showInnerInLoginPosition();
    self.loginController.show();
    selectInner().addClass("loginpos");
  }

  function hideLoginForm(self) {
    showInnerInWaitingPosition();
    self.loginController.hide();
    selectInner().removeClass("loginpos");
  }

  function slideLogoDown(self) {
    new Animation({
      period: TRANSITION_PERIOD,
      frameTime: 1,
      iterations: 1,
      renderTween: function(frameIndex) {
        showInnerInPosition((TRANSITION_PERIOD - frameIndex) / TRANSITION_PERIOD);
      },
      renderFinal: function() {
        hideLoginForm(self);
      }
    }).start();
  }

  function slideLogoUp(self) {
    new Animation({
      period: TRANSITION_PERIOD,
      frameTime: 1,
      iterations: 1,
      renderTween: function(frameIndex) {
        showInnerInPosition(frameIndex / TRANSITION_PERIOD);
      },
      renderFinal: function() {
        showLoginForm(self);
      }
    }).start();
  }

  function toBareState(self) {
    if (!selectInner().hasClass("loginpos")) {
      hideLoginForm(self);
    }
    else {
      slideLogoDown(self);
    }
  }

  function toLoginStateNoCheck(self) {
    if (selectInner().hasClass("loginpos")) {
      showLoginForm(self);
    }
    else {
      slideLogoUp(self);
    }
  }

  function toLoginState(self) {
    if (!CONTINUE_ANYWAY_COOKIE.get() && !Services.videoService.isCapable()) {
      showInnerInWaitingPosition();
      selectMessageBox()
        .append($("<div>")
          .append($("<span>").text(NO_VID + " "))
          .append($("<a>").text(VID_SUPPORT_REF).attr("target", "_new").attr("href", VID_SUPPORT_URL)))
        .append($("<div>")
          .append($("<button>").text(CONTINUE_ANYWAY).click(function() {
            CONTINUE_ANYWAY_COOKIE.set("1");
            selectMessageBox().empty();
            toLoginStateNoCheck(self);
          })));
    }
    else {
      toLoginStateNoCheck(self);
    }
  }

  function showWaitingIndicator(self) {
    if (!self.waitingController) {
      self.waitingController = new WaitAnimController();
    }
    showInnerInWaitingPosition();
    selectInner().removeClass("loginpos");
    self.waitingController.show().start();
  }

  function removeWaitingIndicator(self) {
    if (self.waitingController) {
      self.waitingController.stop().hide();
    }
  }

  // TODO: make this into a component.
  function showUnresponsive() {
    selectMessageBox().text("We're not able to connect to Living Connections' server at this time. " +
      "We'll keep trying. In the meantime, please check your internet connection.");
  }

  function handleSessionManagerStateChange(sessionManager) {
    var self = this;
    sessionManager.waiting ? showWaitingIndicator(self) : removeWaitingIndicator(self);
    if (sessionManager.isUnresponsive()) {
      showUnresponsive(self);
    }
  }

  function Controller() {
    var self = this;
    self.loginController = new LoginController();
    Services.sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
  }

  Controller.prototype = {
    showUi: function() {
      selectContainer().show();
    },
    hideUi: function() {
      selectContainer().hide();
    },
    toBareState: function() {
      toBareState(this);
    },
    toLoginState: function() {
      toLoginState(this);
    }
  }

  return Controller;
});
