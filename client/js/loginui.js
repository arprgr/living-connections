// loginui.js

define([ "jquery", "ui/index", "services" ], function($, ui, Services) {

  var Button = ui.Button;
  var Component = ui.Component;
  var EmailInput = ui.EmailInput;

  function showMessage(self, msg) {
    self.container.find(".message").text(msg || "");
  }

  function submit(self, text) {
    Services.sessionManager.requestEmailVerification(text)
    .then(function() {
      showMessage(self, "Login link sent to your email box.  You may close this window.");
      self.goButton.enabled = false;
      self.emailInput.enabled = false;
    })
    .catch(function(e) {
      showMessage(self, "Can't reach the server. Please try again.");
    })
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var emailInput = new EmailInput($("<span>"))
      emailInput.addPlugin({
        submit: function(text) {
          submit(self, text);
        },
        showInvalid: function() {
          showMessage(self, "That doesn't look like an email address.  Please retype it and try again.");
        }
      });
      emailInput.valid.addChangeListener(function(valid) {
        if (valid && emailInput.enabled) {
          showMessage(self);
        }
      });

      var goButton = Button.create("Go!", function() {
        emailInput.submit();
      });

      self.container
        .append($("<div>")
          .text("Log in with your email address:"))
        .append($("<div>")
          .append(emailInput.container)
          .append(goButton.container))
        .append($("<div>").addClass("message"));

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
