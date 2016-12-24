// loginui.js

define([ "jquery", "emailinput", "services" ], function($, EmailInputComponent, Services) {

  function LoginComponent(container) {
    this.container = container;
    this._render();
  }

  function selectMessageBox(self) {
    return self.container.find(".message");
  }

  function showMessage(self, msg) {
    selectMessageBox(self).text(msg || "");
  }

  function submit(self, text) {
    Services.sessionManager.requestEmailVerification(text)
    .then(function() {
      showMessage(self, "Login link sent to your email box.  You may close this window.");
    })
    .catch(function(e) {
      showMessage(self, "Can't reach the server. Please try again.");
    })
  }

  function render(self) {

    var input = new EmailInputComponent($("<span>"))
      .onValid(function() {
        showMessage(self);
      })
      .onInvalid(function() {
        showMessage(self, "That doesn't look like an email address.  Please retype it and try again.");
      })
      .onSubmit(function(text) {
        submit(self, text);
      })

    self.container
      .hide()
      .append($("<div>")
        .text("Log in with your email address:"))
      .append($("<div>")
        .append(input.container)
        .append($("<button>")
          .text("Go!")
          .click(function() {
            input.activate();
            return true;
          })))
      .append($("<div>").addClass("message"));
  }

  LoginComponent.prototype = {
    show: function() {
      var self = this;
      self.container.show();
      if (self.emailInput) {
        self.emailInput.focus();
      }
    },
    hide: function() {
      self.container.hide();
    },
    _render: function() {
      render(this);
    }
  }

  return LoginComponent;
});
