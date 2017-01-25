// textinput.js - TextInput component

define([ "jquery", "ui/component", "ui/observable" ], function($, Component, Observable) {

  return Component.defineClass(function(c) {

    c.defineDefaultContainer("<span>");

    c.defineDefaultOptions({
      invalidCssClass: "invalid"
    });

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
      self.container.append($("<input>")
        .attr("type", "text")
        .on("blur", function() {
          self.validate();
        })
        .on("keydown", function(event) {
          if (event.originalEvent.keyCode == 13) {
            self.submit();
          }
          return true;
        })
        .on("change paste keyup", function() {
          self.clearStyles();
          self.notifyChangeListeners();
        }));
      self._value = "";
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
      set: function(val) {
        if (val != this.value) {
          this.input.val(val);
          this.notifyChangeListeners();
        }
      }
    });

    c.defineProperty("valid", {
      get: function() {
        return this._isValueValid(this.value);
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
      _isValueValid: function(value) {
        return value.length > 0;
      },

      validate: function() {
        var self = this;
        var valid = self.valid;
        if (valid || self.value == "") {
          self.clearStyles();
        }
        else {
          self.input.addClass(self.options.invalidCssClass);
        }
        return valid;
      },

      submit: function() {
        var self = this;
        var isValid = self.validate();
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
        this.input.removeClass(this.options.invalidCssClass);
      }
    });
  });
});
