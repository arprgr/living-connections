// button.js - standard button component

define([ "ui/component" ], function(Component) {

  var Button = Component.defineClass(function(c) { 

    c.defineDefaultContainer("<button>");

    c.defineInitializer(function() {
      var self = this;
      self.ele.click(function() {
        self.click();
      });
      self.ele.on("keydown", function(event) {
        if (self.enabled && event.originalEvent.keyCode == 13) {
          self.click();
        }
        return true;
      });
      self.label = self.options.label || "";
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
        return !this.ele.attr("disabled");
      },
      set: function(enabled) {
        enabled = !!enabled;
        if (this.enabled != enabled) {
          this.ele.attr("disabled", !enabled);
        }
      }
    });

    c.extendPrototype({
      focus: function() {
        this.ele.focus();
        return this;
      },
      click: function() {
        var self = this;
        self.invokePlugin("click");   // deprecated
        self.invokePlugin("onClick");
        return self;
      }
    });
  });

  // Handy factory method.
  Button.create = function(label, onClick) {
    return new Button().setLabel(label).addPlugin({
      onClick: onClick
    });
  }

  return Button;
});
