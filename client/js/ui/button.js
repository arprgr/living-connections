// button.js - standard button component

define([ "ui/component" ], function(Component) {

  var Button = Component.defineClass(function(c) { 

    c.defineDefaultContainer("<button>");

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
      self.ele.click(function() {
        self.invokePlugin("click");
      });
    });

    c.defineProperty("label", {
      get: function() {
        return this.text;
      },
      set: function(label) {
        this.text = label;
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
          self.container.attr("disabled", !enabled);
        }
      }
    });

    c.extendPrototype({
      focus: function() {
        this.ele.focus();
        return this;
      }
    });
  });

  // Handy factory method.
  Button.create = function(label, onClick) {
    return new Button().setLabel(label).addPlugin({
      click: onClick
    });
  }

  return Button;
});
