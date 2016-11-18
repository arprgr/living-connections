// appui.js

define([ "jquery", "session" ], function($, session) {

  function selectContainer() {
    return $("#app");
  }

  function selectHeader() {
    return $("#app .header");
  }

  function selectBody() {
    return $("#app .body");
  }

  function showUi() {
    selectContainer().show();
  }

  function hideUi() {
    selectContainer().hide();
  }

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(function() {
      handleSessionManagerStateChange(self);
    });
  }

  function logOut(self) {
    self.sessionManager.logOut();
  }

  function renderHeader(self) {
    selectHeader()
      .empty()
      .append($("<span>")
        .addClass("welcome")
        .text("Welcome, "))
      .append($("<span>")
        .addClass("who")
        .text(self.sessionManager.userName + " "))
      .append($("<a>")
        .addClass("function")
        .text("Log out")
        .attr("href", "#")
        .click(function() {
          logOut(self);
        }))
  }

  function renderActionItems(self) {
  }

  function render(self) {
    renderHeader(self);
    renderActionItems(self);
  }

  function handleSessionManagerStateChange(self) {
    var sessionManager = self.sessionManager;
    if (sessionManager.state == session.STATE_OPERATING) {
      render(self);
      showUi();
    }
    else {
      hideUi();
    }
  }

  return {
    Controller: Controller
  }
});
