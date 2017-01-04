// component.js - component base

define([ "jquery" ], function($) {

  function Component(container, options) {
    this._container = container;
    this._visible = true;
    this._options = $.extend({}, Object.getPrototypeOf(this).DEFAULT_OPTIONS, options);
  }

  var defineProperty = Object.defineProperty;

  var proto = Component.prototype = {};

  proto.DEFAULT_OPTIONS = {};

  defineProperty(proto, "container", {
    get: function() {
      return this._container;
    }
  });

  defineProperty(proto, "options", {
    get: function() {
      return this._options;
    }
  });

  defineProperty(proto, "visible", {
    get: function() {
      return this._visible;
    },
    set: function(visible) {
      var self = this;
      visible = !!visible;
      if (self._visible != visible) {
        self._visible = visible;
        visible ? self.container.show() : self.container.hide();
      }
    }
  });

  Component.defineClass = function() {

    var baseClass = arguments.length > 1 ? arguments[0] : Component;
    var definer = arguments[arguments.length > 1 ? 1 : 0];
    var initializer = function() {};
    var newClass = function(container) {
      baseClass.call(this, container);
      initializer.call(this);
    }
    var proto = newClass.prototype = Object.create(baseClass.prototype);

    definer({
      defineInitializer: function(_initializer) {
        initializer = _initializer;
      },
      defineDefaultOptions: function(defaultOptions) {
        proto.DEFAULT_OPTIONS = defaultOptions;
      },
      defineFunction: function(name, func) {
        proto[name] = func;
      },
      defineProperty: function(name, definition) {
        defineProperty(proto, name, definition);
      }
    });

    return newClass;
  }

  return Component;
});
