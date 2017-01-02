// button.js - standard button component

define([ "jquery" ], function($) {

  var BUILTIN_CLASS = "standard";
  var ENABLED_CLASS = "enabled";

  function Button(container) {
    var self = this;
    var element = $("<button>")
      .addClass(BUILTIN_CLASS)
      .addClass(ENABLED_CLASS)
      .click(function() {
        self._click();
      });
    self.element = element;
    self._enabled = true;
    self._visible = true;
    if (container) {
      container.append(element);
    }
  }

  function Button_setVisible(self, visible) {
    visible = !!visible;
    if (self._visible != visible) {
      self._visible = visible;
      visible ? self.element.show() : self.element.hide();
    }
  }

  function Button_setEnabled(self, enabled) {
    enabled = !!enabled;
    if (self._enabled != enabled) {
      self._enabled = enabled;
      enabled ? self.element.addClass(ENABLED_CLASS) : self.element.removeClass(ENABLED_CLASS);
    }
  }

  function Button_onClick(self, func) {
    self.clickFunc = func;
    return self;
  }

  function Button_click(self) {
    if (self.enabled && self.clickFunc) {
      self.clickFunc();
    }
  }

  Button.prototype = (function(buttonProto, defineProperty) {

    defineProperty(buttonProto, "label", {
      get: function() {
        return this.element.text();
      },
      set: function(label) {
        this.element.text(label);
      }
    });

    defineProperty(buttonProto, "visible", {
      get: function() {
        return this._visible;
      },
      set: function(visible) {
        Button_setVisible(this, visible);
      }
    });

    defineProperty(buttonProto, "enabled", {
      get: function() {
        return this._enabled;
      },
      set: function(enabled) {
        Button_setEnabled(this, enabled);
      }
    });

    return buttonProto;
  })({

    onClick: function(func) {
      return Button_onClick(this, func);
    },
    _click: function(func) {
      return Button_click(this);
    }

  }, Object.defineProperty);

  return Button;
});
