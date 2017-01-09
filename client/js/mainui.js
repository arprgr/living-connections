// mainui.js - MainComponent

// Manages transitions between listing and activity views.

define([ "jquery", "services", "component", "listingui", "activityui" ],
  function($, Services, Component, Listing, Activity) {

  var sessionManager = Services.sessionManager;

  function updateHeader(self) {
    var user = sessionManager.user || {}
    var header = self.container.find(".header");
    header.find(".userName").text(user.name || "");
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var listing = new Listing($("<div>").addClass("listing")).setVisible(false);
      var activity = new Activity($("<div>").addClass("activity")).setVisible(false);

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
          .append(listing.container)
          .append(activity.container)
        );

      sessionManager.addStateChangeListener(function() {
        updateHeader(self);
      });

      listing.onActionItemOpen = function(actionItem) {
        listing.visible = false;
        listing.close();
        activity.open(actionItem);
        activity.visible = true;
      }

      activity.onActivityClose = function() {
        activity.visible = false;
        activity.close();
        listing.open();
        listing.visible = true;
      };

      self.listing = listing;
      self.activity = activity;
    });

    c.defineFunction("open", function() {
      this.listing.open();
      this.listing.visible = true;
    });

    c.defineFunction("close", function() {
      this.listing.close();
      this.activity.close();
    });
  });
});
