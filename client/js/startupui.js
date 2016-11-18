// startupui.js

define([ "jquery", "session", "loginui", "waitanim", "anim" ], function($, session, loginui, waitanim, anim) {

  function selectContainer() {
    return $("#startup");
  }

  function selectInner() {
    return $("#startup .inner");
  }

  function showUi() {
    selectContainer().show();
  }

  function hideUi() {
    selectContainer().hide();
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
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(function() {
      handleSessionManagerStateChange(self);
    });
    showWaitingState(self);
  }

  function showErrorState(self) {
    selectUnderBox().empty().html(error.render({}));
  }

  function showLoginForm(self) {
    showInnerInLoginPosition();
    self.loginController.show();
    selectInner().addClass("loginpos");
  }

  function showLoginState(self) {

    if (!self.loginController) {
      self.loginController = new loginui.Controller(self.sessionManager);
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

  function showWaitingState(self) {
    if (!self.waitingController) {
      self.waitingController = new waitanim.Controller();
    }
    showInnerInWaitingPosition();
    selectInner().removeClass("loginpos");
    self.waitingController.show().start();
  }

  function removeWaitingState(self) {
    if (self.waitingController) {
      self.waitingController.stop().hide();
    }
  }

  function handleSessionManagerStateChange(self) {
    var sessionManager = self.sessionManager;
    switch (sessionManager.state) {
    case session.STATE_IDLE:
      removeWaitingState(self);
      showUi();
      sessionManager.userName ? showErrorState(self) : showLoginState(self);
      break;
    case session.STATE_OPERATING:
      removeWaitingState(self);
      hideUi();
      break;
    default:
      showWaitingState(self);
    }
  }

  return {
    Controller: Controller
  }
});
