// link.js - standard link component

define([ "ui/component" ], function(Component) {

  var Link = Component.defineClass(function(c) { 

    c.defineDefaultContainer("<a>");

    c.defineDefaultOptions({
      disabledCssClass: "disabled"
    });

    c.defineInitializer(function() {
      var self = this;
      self._enabled = true;
      self.ele
        .attr("href", "#")
        .click(function() {
          self.invokePlugin("click");
        });
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
  Link.create = function(text, onClick) {
    return new Link().setText(text).addPlugin({
      click: onClick
    });
  }

  return Link;
});
