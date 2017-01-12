// mainui.js - MainComponent

// Manages transitions between listing and activity views.

define([ "jquery", "services", "component", "listingui", "activities", "crossfade" ],
  function($, Services, Component, Listing, Activities, CrossFade) {

  var sessionManager = Services.sessionManager;

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
        );

      sessionManager.addStateChangeListener(function() {
        var user = sessionManager.user || {}
        var header = self.container.find(".header");
        header.find(".userName").text(user.name || "");
      });
    });

    function open(self, newBody, actionItem) {
      newBody.open(actionItem);
      newBody.addPlugin({
        openActionItem: function(actionItem) {
          open(self, new (Activities.ClassForActionItem(actionItem))(), actionItem);
        },
        exit: function() {
          open(self, new Listing());
        }
      });
      self.container.find(".body").append(newBody.container);
      var oldBody = self.currentBody;
      if (oldBody) {
        new CrossFade(oldBody, newBody, { duration: 700 }).run()
        .then(function() {
          oldBody.container.remove();
        });
      }
      self.currentBody = newBody;
    }

    c.defineFunction("open", function() {
      var self = this;
      if (!self.currentBody) {
        open(self, new Listing());
      }
    });

    c.defineFunction("close", function() {
      var self = this;
      if (self.currentBody) {
        self.currentBody.close();
        self.currentBody = null;
      }
    });
  });
});
