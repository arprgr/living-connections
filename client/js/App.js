// appui.js

define([ "jquery", "services", "Login", "Listing", "activities", "waitanim", "ui/index" ],
function($,        Services,   Login,   Listing,   Activities,   WaitAnim,   ui) {

  var NO_VID =
    "Sorry, this browser is not capable of sending and receiving Living Connections videograms.";

  var CANT_CONNECT =
    "We're not able to connect to Living Connections' server at this time.  " +
    "We'll keep trying. In the meantime, please check your internet connection."

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

      function update() {
        var user = sessionManager.user || {}
        userNameLabel.setText(user.name || "");
        emailLabel.setText(user.email && user.email != user.name ? user.email : "");
        logoutLink.setEnabled(!!sessionManager.user);
      }

      sessionManager.addStateChangeListener(update);
      sessionManager.addActionListener(update);
    });
  });

  var MainView = ui.Component.defineClass(function(c) {

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
      return self;
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
        return Main_open(self, Main_newListing(self));
      },

      close: function() {
        var self = this;
        self.currentBody && self.currentBody.close();
        return self;
      }
    });
  });

  return function() {

    var STARTUP_VIEW = "startup";
    var LOGIN_VIEW = "login";
    var MAIN_VIEW = "main";

    var carton = new ui.Carton($("#content"), {
      noAppend: true,
      goalType: ui.FadeGoal,
      initialState: STARTUP_VIEW
    })

    carton.addCompartment(STARTUP_VIEW, new ui.Component($("#startup")));
    carton.addCompartment(LOGIN_VIEW, new Login($("#login")));
    carton.addCompartment(MAIN_VIEW, new MainView($("#app")));

    var under = $("#startup .under");
    var waitAnim = new WaitAnim($("<div>"), { ndots: 10 });
    under.after(waitAnim.ele);

    function show(state, msg) {
      carton.show(state);
      under.text(msg || "");
    }

    function handleSessionStateChange(sessionManager) {
      if (sessionManager.isUnresponsive()) {
        show(STARTUP_VIEW, CANT_CONNECT);
      }
      else if (sessionManager.isLoginRequired()) {
        show(LOGIN_VIEW);
      }
      else if (sessionManager.isActive()) {
        show(MAIN_VIEW);
      }
      if (sessionManager.waiting) {
        waitAnim.start();
      }
      else {
        waitAnim.stop();
      }
    }

    function startSession() {
      sessionManager.addStateChangeListener(handleSessionStateChange);
      sessionManager.init();
    }

    this.open = function() {
      carton.open();
      if (Services.videoService.isCapable()) {
        startSession();
      }
      else {
        show(STARTUP_VIEW, NO_VID);
      }
    }
  }
});
