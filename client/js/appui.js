// appui.js

define([ "jquery", "session", "vid" ], function($, session, vid) {

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

  function iconUri(item) {
    return "/assets/" + item.type + ".png";
  }

  function closeActivity(self) {
    self.activity = null;
    renderActionItems(self);
  }

  function renderActivity(self) {
    selectBody()
      .empty()
      .append($("<div>").text(self.activity.title))
      .append($("<div>").append($("<button>").text("Back").click(function() { closeActivity(self); })))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
    ;
    var localVideo = document.getElementById("localVideo");
    var localVideoController = new vid.LocalVideoController(localVideo);
  }

  function handleClick(self, item) {
    self.activity = item;
    renderActivity(self);
  }

  function renderActionItem(self, item) {
    return $("<div>")
      .addClass("action")
      .append($("<img>")
        .attr("src", iconUri(item)))
      .append($("<span>")
        .text(item.title))
      .click(function() {
        handleClick(self, item);
      });
  }

  function renderActionItems(self) {
    var $body = selectBody().empty();
    var actionItems = self.sessionManager.actionItems;
    if (actionItems) {
      for (var i = 0; i < actionItems.length; ++i) {
        var item = actionItems[i];
        $body.append(renderActionItem(self, item));
      }
    }
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
