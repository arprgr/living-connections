// loginui.js

define([ "jquery" ], function($) {

  // Email validation

  var EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  // 

  function selectContainer() {
    return $("#startup .login");
  }

  function uiIsVisible() {
    return selectContainer().is(":visible");
  }

  function uiIsRendered() {
    return selectContainer().children().length;
  }

  // Class Controller

  function Controller(sessionManager) {
    this.sessionManager = sessionManager;
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
        self.sessionManager.logInWithEmail(text)
        .catch(function(e) {
          showInvalid(self, "Login failed.");
        })
      }
      else {
        showInvalid(self, "Invalid email.");
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

    selectContainer()
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

  // Class Controller ... member functions

  function show() {
    var self = this;
    if (!uiIsRendered()) {
      render(self);
    }
    selectContainer().show();
    self.input.focus().select();
  }

  function hide() {
    selectContainer().hide();
  }

  Controller.prototype = {
    show: show,
    hide: hide
  }

  // Exports
  return {
    Controller: Controller
  }
});
