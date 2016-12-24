// mainui.js

define([ "jquery", "services", "listingui", "activityui" ],
  function($, Services, ListingController, ActivityComponent) {

  var sessionManager = Services.sessionManager;

  function renderHeader(self) {
    var openActionItem = self.openActionItem || {};
    var user = sessionManager.user || {}
    self.container.find(".header")
      .empty()
      .append($("<span>")
        .addClass("title")
        .text(openActionItem.titleFormat || ""))
      .append($("<span>")
        .addClass("userIdent")
        .append($("<span>").text(user.name || ""))
        .append($("<span>").text(" "))
        .append($("<a>")
          .addClass("logout")
          .text("Log out")
          .attr("href", "#")
          .click(function() {
            sessionManager.logOut();
          })))
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    renderHeader(self);
  }

  function handleActivityOpen(item) {
    var self = this;
    renderHeader(self);
    self.listingController.setVisible(0);
    self.openActionItem = item;
    self.activity = new ActivityComponent(self.container.find(".activity"), item)
      .onActivityClose(handleActivityClose.bind(self))
      .setVisible(1);
  }

  function closeActivity(self) {
    if (self.activity) {
      self.activity.close();
      self.activity = null;
    }
    renderHeader(self);
    self.openActionItem = null;
  }

  function handleActivityClose() {
    var self = this;
    closeActivity(self);
    self.listingController.open();
    self.listingController.setVisible(1);
  }

  function Controller(container) {
    var self = this;
    self.container = container;
    // TODO: this seems the wrong place to do this.
    container
      .append($("<div>").addClass("header"))
      .append($("<div>").addClass("body")
        .append($("<div>").addClass("listing"))
        .append($("<div>").addClass("activity")))
      .hide();
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.listingController = new ListingController(sessionManager)
      .onActionItemOpen(handleActivityOpen.bind(self));
  }

  Controller.prototype = {
    setVisible: function(visible) {
      this.container.setVisible(visible);
      return this;
    },
    open: function() {
      var self = this;
      if (!self.isOpen) {
        self.listingController.open();
        self.isOpen = true;
      }
    },
    close: function() {
      var self = this;
      if (self.isOpen) {
        closeActivity(self);
        self.listingController.close();
        self.isOpen = false;
      }
    }
  }

  return Controller;
});
