// mainui.js - MainComponent

// Manages transitions between listing and activity views.

define([ "jquery", "services", "listingui", "activities", "ui/index" ],
function($,        Services,   Listing,     Activities,   ui) {

  var sessionManager = Services.sessionManager;

  return ui.Component.defineClass(function(c) {

    function Main_open(self, createNewBody) {
      if (!self.inTransition) {
        self.inTransition = true;
        var newBody = createNewBody();
        self.container.find("> .body").append(newBody.container);
        var oldBody = self.currentBody;
        self.currentBody = newBody;
        if (oldBody) {
          oldBody.close();
          self.fadeGoal.addGoal(newBody, 1);
          self.fadeGoal.addGoal(oldBody, 0)
          .then(function() {
            oldBody.container.remove();
            self.inTransition = false;
          });
        }
        else {
          self.inTransition = false;
        }
      }
    }

    function Main_newListing(self) {
      return function() {
        return new Listing()
          .addPlugin({
            openActionItem: function(actionItem) {
              Main_open(self, Main_newActivity(self, actionItem));
            }
          })
          .open();
      }
    }

    function Main_newActivity(self, actionItem) {
      return function() {
        return new (Activities.ClassForActionItem(actionItem))($("<div>"), { actionItem: actionItem })
          .addPlugin({
            openOther: function(actionItem) {
              Main_open(self, Main_newActivity(self, actionItem));
            },
            exit: function() {
              Main_open(self, Main_newListing(self));
            }
          })
          .open();
      }
    }

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

      self.fadeGoal = new ui.FadeGoal();
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        if (!self.currentBody) {
          Main_open(self, Main_newListing(self));
        }
      },

      close: function() {
        var self = this;
        if (self.currentBody) {
          self.currentBody.close();
          self.currentBody = null;
        }
      }
    });
  });
});
