// emailinput.js - EmailInputComponent

define([ "jquery", "textinput" ], function($, TextInput) {

  var EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  return TextInput.defineClass(function(c) {

    c.extendPrototype({
      _isValueValid: function(style) {
        return isValidEmail(this.value.toLowerCase());
      }
    });
  });
});
