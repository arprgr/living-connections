// mainui.js

define([ "jquery", "listingui", "activityui" ], function($, listingui, activityui) {

  function selectContainer() {
    return $("#app");
  }

  function selectHeader() {
    return $("#app .header");
  }

  function showOrHide(doShow) {
    selectContainer()[doShow ? "show" : "hide"](3000);
  }

  function expandString(self, format) {
    var sessionManager = self.sessionManager;
    var openActionItem = self.activityController.openActionItem || {};
    var stuff = {
      u: (sessionManager.user && sessionManager.user.name) || "",
      o: (openActionItem.user && openActionItem.user.name) || ""
    }
    return format.replace(/%u%/g, stuff.u).replace(/%o%/g, stuff.o);
  }

  function renderHeader(self) {
    var sessionManager = self.sessionManager;
    var openActionItem = self.activityController.openActionItem || {};
    var title = "";
    if (sessionManager.user) {
      title = expandString(self, openActionItem.titleFormat || "What's going on for %u%...");
    }
    selectHeader().empty()
      .append($("<span>")
        .addClass("title")
        .text(title))
      .append($("<span>").text(" "))
      .append($("<a>")
        .addClass("function")
        .text("Log out")
        .attr("href", "#")
        .click(function() {
          sessionManager.logOut();
        }));
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    renderHeader(self);
  }

  function handleActivityOpen(item) {
    var self = this;
    self.activityController.open(item);
    self.listingController.setVisible(0);
    self.activityController.showOrHide(1);
    renderHeader(self);
  }

  function handleActivityClose() {
    var self = this;
    self.listingController.open();
    self.activityController.close();
    self.listingController.setVisible(1);
    self.activityController.showOrHide(0);
    renderHeader(self);
  }

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.listingController = new listingui.Controller(sessionManager)
      .onActionItemOpen(handleActivityOpen.bind(self));
    self.activityController = new activityui.Controller(sessionManager)
      .onActivityClose(handleActivityClose.bind(self));
  }

  function open() {
    var self = this;
    var activityController = self.activityController;
    var listingController = self.listingController;
    var which = activityController.openActionItem ? activityController : listingController;
    which.open();
  }

  function close() {
    var self = this;
    self.activityController.close();
    self.listingController.close();
  }

  Controller.prototype = {
    showOrHide: showOrHide,
    open: open,
    close: close
  }

  return {
    Controller: Controller
  }
});
