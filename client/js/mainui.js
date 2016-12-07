// mainui.js

define([ "jquery", "services", "listingui", "activityui" ],
  function($, Services, ListingController, ActivityController) {

  function selectContainer() {
    return $("#app");
  }

  function selectHeader() {
    return $("#app .header");
  }

  // TODO: this seems the wrong place to do this.
  selectContainer()
    .append($("<div>").addClass("header"))
    .append($("<div>").addClass("listing"))
    .append($("<div>").addClass("activity"))
    .hide();

  function expandString(self, format) {
    var sessionManager = Services.sessionManager;
    var openActionItem = self.activityController.openActionItem || {};
    var stuff = {
      u: (sessionManager.user && sessionManager.user.name) || "",
      o: (openActionItem.user && openActionItem.user.name) || ""
    }
    return format.replace(/%u%/g, stuff.u).replace(/%o%/g, stuff.o);
  }

  function renderHeader(self) {
    var sessionManager = Services.sessionManager;
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
        .addClass("logout")
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

  function Controller() {
    var self = this;
    var sessionManager = Services.sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.listingController = new ListingController(sessionManager)
      .onActionItemOpen(handleActivityOpen.bind(self));
    self.activityController = new ActivityController(sessionManager)
      .onActivityClose(handleActivityClose.bind(self));
  }

  Controller.prototype = {
    showOrHide: function(doShow) {
      selectContainer()[doShow ? "show" : "hide"]();
    },
    open: function() {
      var self = this;
      if (!self.isOpen) {
        if (!self.activityController.openActionItem) {
          self.listingController.open();
        }
        self.isOpen = true;
      }
    },
    close: function() {
      var self = this;
      if (self.isOpen) {
        self.activityController.close();
        self.listingController.close();
        self.isOpen = false;
      }
    }
  }

  return Controller;
});
