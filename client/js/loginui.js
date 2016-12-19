// loginui.js

define([ "jquery", "services" ], function($, Services) {

  // Email validation

  var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  // Class Controller private

  function showInvalid(self, msg) {
    self.input
      .addClass("invalid")
      .select();
    self.validationErrorBox.text(msg);
  }

  function removeValidation(self) {
    self.input.removeClass("invalid");
    self.validationErrorBox.text("");
  }

  function submit(self) {
    var text = self.input.val();
    if (text) {
      if (isValidEmail(text)) {
        text = text.toLowerCase();
        Services.sessionManager.logInWithEmail(text)
        .then(function(result) {
          if (result.msg) {
            showInvalid(self, result.msg);
          }
        })
        .catch(function(e) {
          showInvalid(self, "Can't reach the server. Please try again.");
        })
      }
      else {
        showInvalid(self, "That doesn't look like an email address.");
      }
    }
  }

  function render(self) {
    var label = $("<div>").text("Log in with your email address:");
    var input = $("<input>").attr("type", "text");
    var button = $("<button>").text("Go!");
    var validationErrorBox = $("<div>").addClass("error");

    input.on("keydown", function(event) {
      return handleKeyDown(self, event);
    });

    self.container
      .append(label)
      .append($("<div>")
        .append(input)
        .append(button))
      .append(validationErrorBox);

    button.click(function() {
      removeValidation(self);
      submit(self);
      return true;
    });

    self.input = input;
    self.validationErrorBox = validationErrorBox;
  }

  function handleKeyDown(self, event) {
    removeValidation(self);
    if (event.originalEvent.keyCode == 13) {
      submit(self);
    }
    return true;
  }

  function Controller(container) {
    this.container = container;
  }

  Controller.prototype = {
    show: function() {
      var self = this;
      if (!self.container.children().length) {
        render(self);
      }
      self.container.show();
      self.input.focus().select();
    },
    hide: function() {
      self.container.hide();
    }
  }

  return Controller;
});
