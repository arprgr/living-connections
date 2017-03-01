// textinput.js - TextInput component

define([ "ui/input" ], function(Input) {

  return Input.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.input.attr("type", "text");
      self._value = "";
    });

    c.defineProperty("placeholder", {
      get: function() {
        return this.input.attr("placeholder");
      },
      set: function(value) {
        this.input.attr("placeholder", value);
      }
    });

    c.extendPrototype({
      _isValueValid: function(value) {
        return value.length > 0;
      }
    });
  });
});
