// datetimeinput.js - DateTimeInput component

define([ "ui/input" ], function(Input) {

  return Input.defineClass(function(c) {

    c.defineInitializer(function() {
      this.input.attr("type", "datetime-local");
    });

    c.extendPrototype({
      _filterInValue: function(val) {
        try {
          val = val.toISOString().replace(/Z.*$/, "");
        }
        catch (e) {
        }
        return val;
      }
    });
  });
});
