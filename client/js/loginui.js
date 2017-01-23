// loginui.js

define([ "jquery", "ui/index", "fb",          "waitanim", "services" ],
function($,        ui,         FacebookLogin, WaitAnim,   Services) {

  return ui.Component.defineClass(function(c) {

    function submit(self, text) {
      Services.sessionManager.requestEmailVerification(text)
      .then(function() {
        self.messageBox.text = "Login link sent to your email box.  You may close this window.";
        self.goButton.enabled = false;
        self.emailInput.enabled = false;
      })
      .catch(function(e) {
        self.messageBox.text = "Can't reach the server. Please try again.";
      })
    }

    function showWaitingIndicator(self) {
      self.waitAnim.setVisible(true).start();
    }

    function removeWaitingIndicator(self) {
      self.waitAnim.setVisible(false).stop();
    }

    function useFacebook(self) {
      var fb = new FacebookLogin();
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
        useFacebook(self);
      });

      var goButton = ui.Button.create("Send request", function() {
        emailInput.submit();
      });

      var waitAnim = new WaitAnim().setVisible(false);
      var messageBox = new ui.Component();

      self.container
        .append($("<div>").addClass("header"))
        .append($("<div>").addClass("body")
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
                .append(goButton.container.addClass("sendEmail")))
              )
          )
          .append(waitAnim.container.addClass("waiting"))
          .append(messageBox.container.addClass("message"))
        );

      Services.sessionManager.addStateChangeListener(function(sessionManager) {
        sessionManager.waiting ? showWaitingIndicator(self) : removeWaitingIndicator(self);
        self.messageBox.text = sessionManager.isUnresponsive()
          ? ("We're not able to connect to Living Connections' server at this time.  " +
            "We'll keep trying. In the meantime, please check your internet connection.")
          : "";
      });

      self.waitAnim = waitAnim;
      self.messageBox = messageBox;
      self.emailInput = emailInput;
      self.goButton = goButton;
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        setTimeout(function() {
          self.emailInput.focus();
        }, 100);
      }
    });
  });
});
