// startupui.js

define([ "jquery", "services", "loginui", "waitanim", "anim" ],
  function($, Services, LoginController, WaitAnimController, Animation) {

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

  function checkBrowser(self) {
    if (!self.browserChecked) {
      self.browserChecked = true;
      if (!Services.videoService.isCapable()) {
        showInnerInWaitingPosition();
        selectMessageBox().text("Sorry, your browser is not capable of running the awesome Living Connections experience.");
        return false;
      }
    }
    return true;
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

  function toBrowerWarningState() {
    selectMessageBox().text("Your browser is not capable of running Living Connections.");
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
      var self = this;
      if (!selectInner().hasClass("loginpos")) {
        hideLoginForm(self);
      }
      else {
        slideLogoDown(self);
      }
    },
    toLoginState: function() {
      var self = this;
      if (checkBrowser(self)) { 
        if (selectInner().hasClass("loginpos")) {
          showLoginForm(self);
        }
        else {
          slideLogoUp(self);
        }
      }
    }
  }

  return Controller;
});
