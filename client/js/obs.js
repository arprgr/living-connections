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

  // Class obs.Observable.

  function Observable(value) {
    var self = this;
    self.value = value;
    self.listeners = [];
  }

  function addChangeListener(listener) {
    addListener(this.listeners, listener);
  }

  function removeChangeListener(listener) {
    removeListener(this.listeners, listener);
  }

  function notifyChangeListeners(listener) {
    notifyListeners(this.listeners, this.value);
  }

  Observable.prototype = {
    addChangeListener: addChangeListener,
    removeChangeListener: removeChangeListener,
    notifyChangeListeners: notifyChangeListeners
  }

  return {
    Observable: Observable
  }
});
