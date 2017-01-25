// textinput.js - TextInput component

define([ "ui/input" ], function(Input) {

  return Input.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.input.attr("type", "text");
      self._value = "";
    });

    c.extendPrototype({
      _isValueValid: function(value) {
        return value.length > 0;
      }
    });
  });
});
