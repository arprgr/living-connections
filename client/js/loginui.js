// loginui.js

define([ "jquery", "services" ], function($, Services) {

  // Email validation

  var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  // Class LoginComponent

  function LoginComponent(container) {
    this.container = container;
    this._render();
  }

  function selectInput(self) {
    return self.container.find("input");
  }

  function selectMessageBox(self) {
    return self.container.find(".message");
  }

  function showInvalid(self, msg) {
    selectInput(self)
      .addClass("invalid")
      .select();
    selectMessageBox(self).text(msg);
  }

  function showValid(self, msg) {
    selectInput(self).removeClass("invalid");
    selectMessageBox(self).text(msg || "");
  }

  function submit(self) {
    var text = selectInput(self).val();
    if (text) {
      if (isValidEmail(text)) {
        text = text.toLowerCase();
        Services.sessionManager.requestEmailVerification(text)
        .then(function() {
          showValid(self, "Login link sent to your email box.  You may close this window.");
        })
        .catch(function(e) {
          showInvalid(self, "Can't reach the server. Please try again.");
        })
      }
      else {
        showInvalid(self, "That doesn't look like an email address.  Please retype it and try again.");
      }
    }
  }

  function render(self) {

    function handleKeyDown(event) {
      showValid(self);
      if (event.originalEvent.keyCode == 13) {
        submit(self);
      }
      return true;
    }

    function handleClick() {
      showValid(self);
      submit(self);
      return true;
    }

    self.container
      .hide()
      .append($("<div>")
        .text("Log in with your email address:"))
      .append($("<div>")
        .append($("<input>")
          .attr("type", "text")
          .on("keydown", function(event) {
            return handleKeyDown(event);
          }))
        .append($("<button>")
          .text("Go!")
          .click(function() {
            return handleClick();
          })))
      .append($("<div>").addClass("message"));
  }

  LoginComponent.prototype = {
    show: function() {
      var self = this;
      self.container.show();
      selectInput(self).focus().select();
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
