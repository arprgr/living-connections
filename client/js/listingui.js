// listingui.js

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
    selectContainer().show(3000);
  }

  function hideUi() {
    selectContainer().hide();
  }

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
  }

  function logOut(self) {
    self.sessionManager.logOut();
  }

  function renderHeader(self) {
    var header = selectHeader()
      .empty()
      .append($("<span>")
        .addClass("welcome")
        .text("Welcome, "));
    if (self.sessionManager.user) {
      header
        .append($("<span>")
          .addClass("who")
          .text(self.sessionManager.user.name + " "))
        .append($("<a>")
          .addClass("function")
          .text("Log out")
          .attr("href", "#")
          .click(function() {
            logOut(self);
          }));
    }
  }

  function iconUri(item) {
    return "/img/" + item.type + ".png";
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

  function handleSessionManagerStateChange(self) {
    var self = this;
    renderHeader(self);
  }

  function handleSessionManagerActionChange() {
    var self = this;
    renderActionItems(self);
  }

  Controller.prototype = {
    showUi: showUi,
    hideUi: hideUi
  }

  return {
    Controller: Controller
  }
});
