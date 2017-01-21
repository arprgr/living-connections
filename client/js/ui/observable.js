// obs.js

define([], function() {

  function addListener(listeners, listener) {
    listeners.push(listener);
    return {
      undo: function() {
        removeListener(listeners, listener);
      }
    }
  }

  function removeListener(listeners, listener) {
    var ix = listeners.indexOf(listener);
    if (ix >= 0) {
      listeners.splice(ix, 1);
    }
  }

  function notifyListeners(listeners, data) {
    for (var i = 0; i < listeners.length; ++i) {
      listeners[i](data);
    }
  }

  // Class Observable.

  function Observable(value) {
    var self = this;
    self._value = value;
    self.listeners = [];
  }

  Observable.prototype = {
    addChangeListener: function(listener) {
      return addListener(this.listeners, listener);
    },
    removeChangeListener: function(listener) {
      removeListener(this.listeners, listener);
    },
    setValue: function(value) {
      this.value = value;
      return this;
    }
  }

  Object.defineProperty(Observable.prototype, "value", {
    get: function() {
      return this._value;
    },
    set: function(value) {
      var self = this;
      if (value != self._value) {
        self._value = value;
        notifyListeners(self.listeners, value);
      }
    }
  });

  return Observable;
});
