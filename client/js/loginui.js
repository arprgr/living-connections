// loginui.js

define([ "jquery", "ui/index", "fblogin",     "waitanim", "services" ],
function($,        ui,         FacebookLogin, WaitAnim,   Services) {

  var EmailForm = ui.Component.defineClass(function(c) {

    function submit(self, text) {
      Services.sessionManager.requestEmailTicket(text)
      .then(function() {
        self.messageBox.text = "Login link sent to your email box.  You may close this window.";
        self.sendButton.enabled = false;
        self.emailInput.enabled = false;
        self.fbButton.enabled = false;
      })
      .catch(function(e) {
        self.messageBox.text = "Can't reach the server. Please try again.";
      })
    }

    c.defineInitializer(function() {
      var self = this;

      var emailInput = new ui.EmailInput().addPlugin({
        submit: function(text) {
          submit(self, text);
        },
        showInvalid: function() {
          self.messageBox.text = "That doesn't look like an email address.  Please retype it and try again.";
        }
      });
      emailInput.addChangeListener(function() {
        if (emailInput.valid && emailInput.enabled) {
          self.messageBox.text = "";
        }
      });

      var fbButton = ui.Button.create("Log in through Facebook", function() {
        self.invokePlugin("openFacebookForm");
      });

      var sendButton = ui.Button.create("Send request", function() {
        emailInput.submit();
      });

      var messageBox = new ui.Component();

      self.container
        .append($("<div>").addClass("big").addClass("chunk")
          .text("Log in to Living Connections"))
        .append($("<div>").addClass("chunk")
          .append(fbButton.container.addClass("useFb")))
        .append($("<div>").addClass("big").addClass("chunk")
          .text("OR"))
        .append($("<div>").addClass("form")
          .append($("<div>").text("Use your email address to log in:"))
          .append($("<div>").addClass("indent")
            .append($("<div>").addClass("prompt")
              .text("EMAIL ADDRESS"))
            .append($("<div>")
              .append(emailInput.container))
            .append($("<div>")
              .append(sendButton.container.addClass("sendEmail")))
          )
        )
        .append(messageBox.container.addClass("chunk").addClass("message"));

      self.messageBox = messageBox;
      self.emailInput = emailInput;
      self.sendButton = sendButton;
      self.fbButton = fbButton;
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        self.messageBox.text = "";
        setTimeout(function() {
          self.emailInput.focus();
        }, 100);
      }
    });
  });

  var FacebookInfo = ui.Component.defineClass(function(c) {

    var facebookService = Services.facebookService;

    c.defineInitializer(function() {
      var self = this;
      var userImage = new ui.Image($("<span>"));
      var nameLabel = new ui.Component($("<span>"));
      var emailLabel = new ui.Component($("<span>"));
      var loginButton = new ui.Button("", function() {
        loginButton.enabled = false;
        Services.sessionManager.logInWithFacebook(facebookService.value);
      });

      self.container
        .append($("<span>").text("You:"))
        .append(userImage.container)
        .append(nameLabel.container)
        .append(emailLabel.container)
        .append(loginButton.container);

      function updateState(fbInfo) {
        if (fbInfo && fbInfo.state == facebookService.CONNECTED) {
          userImage.src = (fbInfo.picture && fbInfo.picture.url) || "";
          nameLabel.text = fbInfo.name || "";
          emailLabel.text = fbInfo.email || "";
          loginButton.label = "Log in" + (fbInfo.name ? (" as " + fbInfo.name) : ""); 
          loginButton.enabled = true;
        }
        else {
          loginButton.enabled = false;
        }
      }

      updateState(facebookService.value);
      facebookService.addChangeListener(updateState);
    });
  });

  var FacebookReadout = ui.Carton.defineClass(function(c) {

    var WAIT = "wait";
    var INFO = "info";
    var FBLOGIN = "fblogin";
    var ERROR = "error";

    var facebookService = Services.facebookService;

    c.defineInitializer(function() {
      var self = this;
      self
        .addCompartment(WAIT, new WaitAnim($("<div>"), { ndots: 8 }))
        .addCompartment(INFO, new FacebookInfo())
        .addCompartment(FBLOGIN, new FacebookLogin())
        .addCompartment(ERROR, new ui.Component($("<div>"), { cssClasses: [ "message", "chunk" ] })
          .setText("Sorry, we can't connect to Facebook now"))
        .addState(INFO, [ INFO, FBLOGIN ]);

      function updateState(fbInfo) {
        self.show(fbInfo
          ? (fbInfo.state == facebookService.CONNECTED && fbInfo.id ? INFO : ERROR)
          : WAIT);
      }

      updateState(facebookService.value);
      facebookService.addChangeListener(updateState);
    });

    c.extendPrototype({
      open: function() {
        ui.Carton.prototype.open.call(this);
        facebookService.open();
      }
    });
  });

  var FacebookForm = ui.Carton.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self
        .addCompartment(0, new ui.Component().setText("Log in through Facebook"))
        .addCompartment(1, new FacebookReadout())
        .addCompartment(2, ui.Button.create("Go Back", function() {
          self.invokePlugin("openEmailForm");
        }));
    });
  });

  return ui.Component.defineClass(function(c) {

    var EMAIL = "email";
    var FB = "facebook";

    c.defineInitializer(function() {
      var self = this;
      var carton = new ui.Carton($("<div>").addClass("body"), {
          initialState: EMAIL
      }).addCompartment(EMAIL, new EmailForm().addPlugin(self))
        .addCompartment(FB, new FacebookForm().addPlugin(self));
      self.container
        .append($("<div>").addClass("header"))
        .append(carton.container);
      self.carton = carton;
    });

    c.extendPrototype({
      open: function() {
        this.carton.open();
      },
      close: function() {
        this.carton.close();
      },
      openFacebookForm: function() {
        return this.carton.show(FB);
      },
      openEmailForm: function() {
        return this.carton.show(EMAIL);
      }
    });
  });
});
