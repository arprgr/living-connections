// startupui.js - StartupComponent

define([ "jquery", "services", "loginui", "waitanim", "anim", "cookie" ],
  function($, Services, LoginController, WaitAnimController, Animation, Cookie) {

  var NO_VID = "Sorry, but your browser is not capable of sending and receiving Living Connections video messages.";
  var VID_SUPPORT_REF = "Read more about supported browsers.";
  var VID_SUPPORT_URL = "http://recordrtc.org"
  var CONTINUE_ANYWAY = "Continue anyway";

  var CONTINUE_ANYWAY_COOKIE = new Cookie("xd");

  function selectInner(self) {
    return self.container.find(".inner");
  }

  function selectMessageBox(self) {
    return self.container.find(".message");
  }

  var LOGIN_TOP = -338;
  var HEIGHT_REDUX = 290;
  var TRANSITION_PERIOD = 900;

  function showInnerInPosition(self, part) {
    selectInner(self).css("top", part * LOGIN_TOP);
    self.container.height(self.originalHeight - (part * HEIGHT_REDUX));
  }

  function showInnerInWaitingPosition(self) {
    showInnerInPosition(self, 0);
  }

  function showInnerInLoginPosition(self) {
    showInnerInPosition(self, 1);
  }

  function showLoginForm(self) {
    showInnerInLoginPosition(self);
    self.loginController.show();
  }

  function hideLoginForm(self) {
    showInnerInWaitingPosition(self);
    self.loginController.hide();
  }

  function slideLogoDown(self) {
    new Animation({
      period: TRANSITION_PERIOD,
      frameTime: 1,
      iterations: 1,
      renderTween: function(frameIndex) {
        showInnerInPosition(self, (TRANSITION_PERIOD - frameIndex) / TRANSITION_PERIOD);
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
        showInnerInPosition(self, frameIndex / TRANSITION_PERIOD);
      },
      renderFinal: function() {
        showLoginForm(self);
      }
    }).start();
  }

  function toBareState(self) {
    if (self.loginState) {
      slideLogoDown(self);
      self.loginState = true;
    }
    else {
      // Just to make sure?
      hideLoginForm(self);
    }
  }

  function toLoginStateNoCheck(self) {
    if (self.loginState) {
      showLoginForm(self);
    }
    else {
      slideLogoUp(self);
      self.loginState = true;
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
    showInnerInWaitingPosition(self);
    selectInner(self).removeClass("loginpos");
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

  function StartupComponent(container) {
    var self = this;
    self.container = container;
    self.loginController = new LoginController();
    self.originalHeight = container.height();
    self.loginState = false;
    Services.sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
  }

  StartupComponent.prototype = {
    setVisible: function(visible) {
      this.container.setVisible(visible);
      return this;
    },
    toBareState: function() {
      toBareState(this);
    },
    toLoginState: function() {
      toLoginState(this);
    }
  }

  return StartupComponent;
});
