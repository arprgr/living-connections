// emailinput.js - EmailInputComponent

define([ "jquery", "component", "obs" ], function($, Component, Observable) {

  var EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  var INVALID_CLASS = "invalid";

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container.append($("<input>")
        .attr("type", "text")
        .on("blur", function() {
          self.validateAndStyle();
        })
        .on("keydown", function(event) {
          if (event.originalEvent.keyCode == 13) {
            self.submit();
          }
          return true;
        })
        .on("change paste keyup", function() {
          self.clearStyles();
          self.validate();
        }));
      self.valid = new Observable(false);
    });

    c.defineProperty("input", {
      get: function() {
        return this.container.find("input");
      }
    });

    c.defineProperty("value", {
      get: function() {
        return this.input.val().toLowerCase();
      },
      set: function(value) {
        var self = this;
        self.input.val(value);
        self.validate();
      }
    });

    c.defineFunction("validate", function(style) {
      var self = this;
      var isValid = isValidEmail(self.value);
      self.valid.setValue(isValid);
      return isValid;
    });

    c.defineFunction("validateAndStyle", function(style) {
      var self = this;
      if (self.validate() || self.value == "") {
        self.clearStyles();
      }
      else {
        self.input.addClass(INVALID_CLASS);
      }
    });

    c.defineFunction("submit", function() {
      var self = this;
      var isValid = self.validate(true);
      if (isValid) {
        self.onSubmit && self.onSubmit(self.value);
      }
      else {
        self.input.focus().select();
      }
    });

    c.defineFunction("focus", function() {
      this.input.focus();
    });

    c.defineFunction("clearStyles", function() {
      this.input.removeClass(INVALID_CLASS);
    });
  });

  return EmailInputComponent;
});
