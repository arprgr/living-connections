// component.js - component base

define([ "jquery", "ui/observable" ], function($, Observable) {

  var serial = 0; 

  function addCssClasses(ele, cssClass) {
    switch (typeof cssClass) {
    case "string":
      ele.addClass(cssClass);
      break;
    case "object":
      for (var i in cssClass) {
        ele.addClass(cssClass[i]);
      }
    }
  }

  function Component(ele, options) {
    var proto = Object.getPrototypeOf(this);
    ele = ele || $(proto.DEFAULT_CONTAINER);
    options = $.extend({}, proto.DEFAULT_OPTIONS, options);

    Observable.call(this);
    this._ele = ele;
    this._visible = true;
    this._options = options;
    this._plugins = [];
    this._serial = serial++;

    addCssClasses(ele, options.cssClass);
    addCssClasses(ele, options.cssClasses);
  }

  Component.prototype = $.extend(Object.create(Observable.prototype), {
    DEFAULT_CONTAINER: "<div>",
    DEFAULT_OPTIONS: {},

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
      var retval;
      for (var i = 0; i < plugins.length; ++i) {
        var plugin = plugins[i];
        if (method in plugin) {
          retval = plugin[method].apply(plugin, args);
        }
      }
      return retval;
    },

    open: function() {
      return this;
    },
    close: function() {
      return this;
    }
  });

  function defineProperty(proto, propName, propDesc) {
    Object.defineProperty(proto, propName, propDesc);
    if ("set" in propDesc) {
      proto["set" + propName.charAt(0).toUpperCase() + propName.substring(1)] = function(value) {
        this[propName] = value;
        return this;
      }
    }
  }

  function defineComponentProperty(propName, propDesc) {
    defineProperty(Component.prototype, propName, propDesc);
  }

  defineComponentProperty("container", {
    get: function() {
      return this._ele;
    }
  });
  defineComponentProperty("ele", {
    get: function() {
      return this._ele;
    }
  });
  defineComponentProperty("options", {
    get: function() {
      return this._options;
    }
  });
  defineComponentProperty("text", {
    get: function() {
      return this.ele.text();
    },
    set: function(text) {
      this.ele.text(text);
    }
  });
  defineComponentProperty("visible", {
    get: function() {
      return this._visible;
    },
    set: function(visible) {
      var self = this;
      visible = !!visible;
      if (self._visible != visible) {
        self._visible = visible;
        visible ? self.ele.show() : self.ele.hide();
      }
      return self;
    }
  });

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
        defineProperty(proto, name, definition);
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
