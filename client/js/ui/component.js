// component.js - component base

define([ "jquery", "ui/observable" ], function($, Observable) {

  var serial = 0; 

  function Component(container, options) {
    var proto = Object.getPrototypeOf(this);
    Observable.call(this);
    this._container = container || $(proto.DEFAULT_CONTAINER);
    this._visible = true;
    this._options = $.extend({}, proto.DEFAULT_OPTIONS, options);
    this._plugins = [];
    this._serial = serial++;
  }

  Component.prototype = (function(defineProperty) {
    var proto = $.extend(Object.create(Observable.prototype), {
      DEFAULT_CONTAINER: "<div>",
      DEFAULT_OPTIONS: {},

      setVisible: function(visible) {
        var self = this;
        visible = !!visible;
        if (self._visible != visible) {
          self._visible = visible;
          visible ? self.container.show() : self.container.hide();
        }
        return self;
      },

      addPlugin: function(plugin) {
        var plugins = this._plugins;
        plugins.push(plugin);
        return this;
      },

      removePlugin: function(plugin) {
        var plugins = this._plugins;
        var ix = plugins.indexOf(plugin);
        if (ix >= 0) {
          plugins.splice(ix, 1);
        }
        return this;
      },

      invokePlugin: function(method) {
        var plugins = this._plugins;
        var args = Array.prototype.slice.call(arguments);
        var method = args.shift();
        for (var i = 0; i < plugins.length; ++i) {
          var plugin = plugins[i];
          if (method in plugin) {
            plugin[method].apply(plugin, args);
          }
        }
        return this;
      }
    });

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
        this.setVisible(visible);
      }
    });
 
    return proto;
  })(Object.defineProperty);

  function defineClass(baseClass, definer) {
    var initializer = function() {};

    var newClass = function() {
      baseClass.apply(this, arguments);
      initializer.apply(this);
    }

    var proto = newClass.prototype = Object.create(baseClass.prototype);

    definer({
      defineInitializer: function(_initializer) {
        initializer = _initializer;
      },
      defineDefaultContainer: function(defaultContainer) {
        proto.DEFAULT_CONTAINER = defaultContainer;
      },
      defineDefaultOptions: function(defaultOptions) {
        proto.DEFAULT_OPTIONS = $.extend({}, proto.DEFAULT_OPTIONS, defaultOptions);
      },
      extendPrototype: function(extension) {
        $.extend(proto, extension);
      },
      defineProperty: function(name, definition) {
        Object.defineProperty(proto, name, definition);
        if ("set" in definition) {
          proto["set" + name.charAt(0).toUpperCase() + name.substring(1)] = function(value) {
            this[name] = value;
            return this;
          }
        }
      }
    });

    newClass.defineClass = function(definer) {
      return defineClass(newClass, definer);
    };

    return newClass;
  }

  Component.defineClass = function() {
    return defineClass(
      arguments.length > 1 ? arguments[0] : Component,
      arguments[arguments.length > 1 ? 1 : 0]
    );
  }

  return Component;
});
