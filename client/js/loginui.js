// loginui.js

define([ "jquery", "ui/index", "fblogin",     "waitanim", "services" ],
function($,        ui,         FacebookLogin, WaitAnim,   Services) {

  var EmailForm = ui.Component.defineClass(function(c) {

    function submit(self, text) {
      Services.sessionManager.requestEmailVerification(text)
      .then(function() {
        self.messageBox.text = "Login link sent to your email box.  You may close this window.";
        self.sendButton.enabled = false;
        self.emailInput.enabled = false;
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

      var fbButton = ui.Button.create("Use Facebook", function() {
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
          .append($("<div>").text("Request an email ticket:"))
          .append($("<div>").addClass("indent")
            .append($("<div>").addClass("prompt")
              .text("EMAIL ADDRESS"))
            .append($("<div>")
              .append(emailInput.container))
            .append($("<div>")
              .append(sendButton.container.addClass("sendEmail")))
          )
        )
        .append(messageBox.container.addClass("message"));

      self.messageBox = messageBox;
      self.emailInput = emailInput;
      self.sendButton = sendButton;
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

  var FacebookForm = ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var photo = new ui.Image();
      var loginButton = new ui.Button();
      var fbButton = new FacebookLogin();
      var goBackButton = ui.Button.create("Go Back", function() {
        self.invokePlugin("goBack");
      });

      self.container
        .append(photo.container)
        .append(loginButton.container)
        .append(fbButton.container)
        .append(goBackButton.container);

      self.photo = photo;
      self.loginButton = loginButton;
      self.fbButton = fbButton;
      self.goBackButton = goBackButton;
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        if (!self.opened) {
          self.opened = true;
          var facebookService = Services.facebookService;
          facebookService.userInfo.addChangeListener(function(userInfo) {
            self.loginButton.enabled = !!userInfo;
          });
          facebookService.picture.addChangeListener(function(picture) {
            self.photo.src = picture && picture.url;
          });
          facebookService.open();
        }
      }
    });
  });

  return ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var emailForm = new EmailForm();
      var fbForm = new FacebookForm().setVisible(false);
      this.container
        .append($("<div>").addClass("header"))
        .append($("<div>").addClass("body")
          .append(emailForm.container)
          .append(fbForm.container));
      this.emailForm = emailForm.addPlugin({
        openFacebookForm: function() {
          emailForm.visible = false;
          fbForm.visible = true;
          fbForm.open();
        }
      });
      this.fbForm = fbForm.addPlugin({
        goBack: function() {
          emailForm.visible = true;
          emailForm.open();
          fbForm.visible = false;
        }
      });
    });

    c.extendPrototype({
      open: function() {
        this.emailForm.open();
        return this;
      }
    });
  });
});
