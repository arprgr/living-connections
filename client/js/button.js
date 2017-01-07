// button.js - standard button component

define([ "jquery", "component" ], function($, Component) {

  return Component.defineClass(function(c) { 

    c.defineDefaultContainer("<button>");

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
      self._container.click(function() {
        self._click();
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

    c.defineFunction("onClick", function(func) {
      this.clickFunc = func;
      return this;
    });

    c.defineFunction("_click", function() {
      var self = this;
      if (self.enabled && self.clickFunc) {
        self.clickFunc();
      }
    });
  });
});
