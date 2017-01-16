// button.js - standard button component

define([ "ui/component" ], function(Component) {

  var Button = Component.defineClass(function(c) { 

    c.defineDefaultContainer("<button>");

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
      self._container.click(function() {
        self.invokePlugin("click");
      });
    });

    c.defineProperty("label", {
      get: function() {
        return this.container.text();
      },
      set: function(label) {
        this.container.text(label);
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
  });

  // Handy factory method.
  Button.create = function(label, onClick) {
    return new Button().setLabel(label).addPlugin({
      click: onClick
    });
  }

  return Button;
});
