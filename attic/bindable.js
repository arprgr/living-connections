// bindable.js

define(function() {

  function Binding(bindable, listener) {
    var self = this;
    self.bindable = bindable;
    self.listener = listener;
    self.count = 0;
    bindable.addBinding(this);
    self.execute();     // once to initialize
  }
  Binding.prototype = {

    execute: function() {
      var self = this;
      self.listener(self.bindable.value);
      self.count += 1;
    },

    undo: function() {
      var self = this;
      self.bindable.removeBinding(self);
      return self;
    },

    getCount: function() {
      return this.count;
    }
  }

  function Bindable(value) {
    this.bindings = [];
    this.value = value;
  }
  Bindable.prototype = {

    set: function(value) {
      if (this.value !== value) {
        this.value = value;
        var bindings = this.bindings.slice();
        for (var i = 0; i < bindings.length; ++i) {
          bindings[i].execute();
        }
      }
      return this;
    },

    get: function() {
      return this.value;
    },

    addBinding: function(binding) {
      this.bindings.push(binding);
      return this;
    },

    removeBinding: function(binding) {
      var ix = this.bindings.indexOf(binding);
      if (ix >= 0) {
        self.bindings.splice(ix, 1);
      }
      return this;
    },

    onChangeFunc: function() {
      var self = this;
      return function(listener) {
        self.addBinding(new Binding(self, listener));
      }
    }
  }

  return Bindable;
});
