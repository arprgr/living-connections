// textinput.js - TextInput component

define([ "jquery", "ui/component", "ui/observable" ], function($, Component, Observable) {

  var INVALID_CLASS = "invalid";

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
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
        return this.input.val();
      },
      set: function(value) {
        var self = this;
        self.input.val(value);
        self.validate();
      }
    });

    c.defineProperty("enabled", {
      get: function() {
        return this._enabled;
      },
      set: function(enabled) {
        var self = this;
        enabled = !!enabled;
        if (self._enabled != enabled) {
          self._enabled = enabled;
          self.input.attr("disabled", !enabled);
          self.input.attr("readonly", !enabled);
        }
      }
    });

    c.extendPrototype({
      validate: function(style) {
        var self = this;
        var isValid = self._isValueValid();
        self.valid.setValue(isValid);
        return isValid;
      },

      _isValueValid: function() {
        return this.value.length > 0;
      },

      validateAndStyle: function(style) {
        var self = this;
        if (self.validate() || self.value == "") {
          self.clearStyles();
        }
        else {
          self.input.addClass(INVALID_CLASS);
        }
      },

      submit: function() {
        var self = this;
        var isValid = self.validate(true);
        if (isValid) {
          self.invokePlugin("submit", self.value);
        }
        else {
          self.input.focus().select();
          self.invokePlugin("showInvalid");
        }
      },

      focus: function() {
        this.input.focus();
        return this;
      },

      select: function() {
        this.input.select();
        return this;
      },

      clearStyles: function() {
        this.input.removeClass(INVALID_CLASS);
      }
    });
  });
});
