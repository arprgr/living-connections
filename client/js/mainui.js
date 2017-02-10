// mainui.js - MainComponent

// Manages transitions between listing and activity views.

define([ "jquery", "services", "listingui", "activities", "ui/index" ],
function($,        Services,   Listing,     Activities,   ui) {

  var sessionManager = Services.sessionManager;

  // The main app header.
  var MainHeader = ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var titleLabel = new ui.Component("<span>", { cssClass: "title" }).setText("Living Connections");
      var userNameLabel = new ui.Component("<span>", { cssClass: "userName" });
      var emailLabel = new ui.Component("<span>", { cssClass: "email" });
      var logoutLink = new ui.Link("<a>", { cssClass: "logout" }).setText("Log out").addPlugin({
        click: function() {
          sessionManager.logOut();
        }
      });

      self.ele
        .addClass("header")
        .append(titleLabel.ele)
        .append($("<span>")
          .addClass("userIdent")
          .append(userNameLabel.ele)
          .append($("<span>").text(" "))
          .append(emailLabel.ele)
          .append($("<span>").text(" "))
          .append(logoutLink.ele));

      sessionManager.addStateChangeListener(function() {
        var user = sessionManager.user || {}
        userNameLabel.setText(user.name || "");
        emailLabel.setText(user.email || "");
        logoutLink.setEnabled(!!sessionManager.user);
      });
    });
  });

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

      self.ele
        .append(new MainHeader().ele)
        .append($("<div>").addClass("body"));

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
