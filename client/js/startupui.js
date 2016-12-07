// startupui.js

define([ "jquery", "loginui", "waitanim", "anim", "vid" ],
  function($, LoginController, WaitAnimController, anim, LocalVideoController) {

  var SHOW_HIDE_DURATION = 3000;

  function selectContainer() {
    return $("#startup");
  }

  function selectInner() {
    return $("#startup .inner");
  }

  function selectMessageBox() {
    return $("#startup .message");
  }

  function showUi() {
    selectContainer().show(SHOW_HIDE_DURATION);
  }

  function hideUi() {
    selectContainer().hide(SHOW_HIDE_DURATION);
  }

  var LOGIN_TOP = -338;
  var TRANSITION_PERIOD = 900;

  function showInnerInPosition(top) {
    selectInner().css("top", top);
  }

  function showInnerInWaitingPosition() {
    showInnerInPosition(0);
  }

  function showInnerInLoginPosition() {
    showInnerInPosition(LOGIN_TOP);
  }

  // Class Controller

  function Controller(sessionManager) {
    var self = this;
    self.loginController = new LoginController(sessionManager);
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
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

  function toBareState() {
    var self = this;
    if (!selectInner().hasClass("loginpos")) {
      hideLoginForm(self);
    }
    else {
      new anim.Animation({
        period: TRANSITION_PERIOD,
        frameTime: 1,
        iterations: 1,
        renderTween: function(frameIndex) {
          showInnerInPosition((TRANSITION_PERIOD - frameIndex) * LOGIN_TOP / TRANSITION_PERIOD);
        },
        renderFinal: function() {
          hideLoginForm(self);
        }
      }).start();
    }
  }

  function toLoginState() {
    var self = this;
    if (!self.browserChecked) {
      self.browserChecked = true;
      if (!LocalVideoController.IsCapable()) {
        showInnerInWaitingPosition();
        selectMessageBox().text("Sorry, your crap browser is not capable of running the awesome Living Connections experience.");
        return;
      }
    }
    if (selectInner().hasClass("loginpos")) {
      showLoginForm(self);
    }
    else {
      new anim.Animation({
        period: TRANSITION_PERIOD,
        frameTime: 1,
        iterations: 1,
        renderTween: function(frameIndex) {
          showInnerInPosition(frameIndex * LOGIN_TOP / TRANSITION_PERIOD);
        },
        renderFinal: function() {
          showLoginForm(self);
        }
      }).start();
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

  Controller.prototype = {
    showUi: showUi,
    hideUi: hideUi,
    toBareState: toBareState,
    toLoginState: toLoginState
  }

  return Controller;
});
