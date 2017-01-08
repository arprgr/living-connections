// mainui.js - MainComponent

// Manages transitions between listing and activity views.

define([ "jquery", "services", "component", "listingui", "activityui" ],
  function($, Services, Component, ListingController, ActivityComponent) {

  var sessionManager = Services.sessionManager;

  function executeBindings(self) {
    var openActionItem = self.openActionItem || {};
    var user = sessionManager.user || {}
    var header = self.container.find(".header");
    header.find(".title").text(openActionItem.titleFormat || "");
    header.find(".userName").text(user.name || "");
  }

  function handleActivityOpen(item) {
    var self = this;
    executeBindings(self);
    self.listingController.setVisible(0);
    self.openActionItem = item;
    self.activity = new ActivityComponent(self.container.find(".activity"))
      .onActivityClose(handleActivityClose.bind(self))
      .open(item)
  }

  function closeActivity(self) {
    if (self.activity) {
      self.activity.close();
      self.activity = null;
    }
    executeBindings(self);
    self.openActionItem = null;
  }

  function handleActivityClose() {
    var self = this;
    closeActivity(self);
    self.listingController.open();
    self.listingController.setVisible(1);
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      self.container
        .append($("<div>")
          .addClass("header")
          .append($("<span>")
            .addClass("title"))
          .append($("<span>")
            .addClass("userIdent")
            .append($("<span>").addClass("userName"))
            .append($("<span>").text(" "))
            .append($("<a>")
              .addClass("logout")
              .text("Log out")
              .attr("href", "#")
              .click(function() {
                sessionManager.logOut();
              }))))
        .append($("<div>").addClass("body")
          .append($("<div>").addClass("listing"))
          .append($("<div>").addClass("activity"))
        );

      sessionManager.addStateChangeListener(function() {
        executeBindings(self);
      });

      self.listingController = new ListingController()
        .onActionItemOpen(handleActivityOpen.bind(self));
    });

    c.defineFunction("open", function() {
      var self = this;
      if (!self.isOpen) {
        self.listingController.open();
        self.isOpen = true;
      }
    });

    c.defineFunction("close", function() {
      var self = this;
      if (self.isOpen) {
        closeActivity(self);
        self.listingController.close();
        self.isOpen = false;
      }
    });
  });
});
