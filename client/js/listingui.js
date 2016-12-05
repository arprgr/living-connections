// listingui.js

define([ "jquery", "activityui" ], function($, activityui) {

  function selectContainer() {
    return $("#app");
  }

  function selectHeader() {
    return $("#app .header");
  }

  function selectBody() {
    return $("#app .listing");
  }

  function showUi() {
    selectContainer().show(3000);
  }

  function hideUi() {
    selectContainer().hide();
  }

  function showBody() {
    selectBody().show();
  }

  function hideBody() {
    selectBody().hide();
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
    self.openItem = null;
    showBody();
  }

  function handleItemClick(self, item) {
    var self = this;
    self.openItem = item;
    new activityui.Controller(self.sessionManager, closeActivity.bind(self)).open(item);
  }

  function renderActionItem(self, item) {
    return $("<div>")
      .addClass("action")
      .append($("<img>")
        .attr("src", iconUri(item)))
      .append($("<span>")
        .text(item.title))
      .click(function() {
        handleItemClick(self, item);
      });
  }

  function renderActionItems(self, actionItems) {
    var $body = selectBody().empty();
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

  function handleSessionManagerActionChange(actionItems) {
    var self = this;
    renderActionItems(self, actionItems);
  }

  Controller.prototype = {
    showUi: showUi,
    hideUi: hideUi
  }

  return {
    Controller: Controller
  }
});
