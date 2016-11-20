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

  function iconUri(item) {
    return "/assets/" + item.type + ".png";
  }

  function renderActionItems(self) {
    var $body = selectBody().empty();
    var actionItems = self.sessionManager.actionItems;
console.log(self);
console.log(self.sessionManager);
console.log(actionItems);
    if (actionItems) {
      for (var i = 0; i < actionItems.length; ++i) {
        var item = actionItems[i];
        $body.append($("<div>")
          .addClass("action")
          .append($("<img>")
            .attr("src", item.type + ".png")
            .css("width", 40)
            .css("height", 40))
          .append($("<span>")
            .text(item.type))
        );
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
