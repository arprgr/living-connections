// session.js

define([ "jquery" ], function($) {

  // Manager is in one of the following states....
  var STATE_IDLE = 0;
  var STATE_CONNECTING = 1;
  var STATE_OPERATING = 2;
  var STATE_LOGGING_OUT = 3;

  var FETCH_INTERVAL = 5000;
  var INIT_TIMEOUT = 15000;

  var COOKIE_NAME = "s";

  function clearCookie() {
    document.cookie = COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  // Manager constructor.
  function Manager() {
    var self = this;

    // state is initially undefined.
    self.actionItems = [];
    self.stateChangeListeners = [];
    self.errorListeners = [];
    self.errorCount = 0;
  }

  // public - Add a state change listener.
  function addStateChangeListener(listener) {
    var self = this;
    self.stateChangeListeners.push(listener);
    return {
      undo: function() {
        self.removeStateChangeListener(listener);
      }
    }
  }

  // public - Remove a state change listener.
  function removeStateChangeListener(listener) {
    var self = this;
    var ix = self.stateChangeListeners.indexOf(listener);
    if (ix >= 0) {
      self.stateChangeListeners.splice(ix, 1);
    }
  }

  // private unbound - Notify state change listeners.
  function notifyStateChangeListeners(self) {
    for (var i = 0; i < self.stateChangeListeners.length; ++i) {
      self.stateChangeListeners[i](self);
    }
  }

  // private unbound - Change state.
  function setState(self, state) {
    if (state != self.state) {
      self.state = state;
      notifyStateChangeListeners(self);
    }
  }

  // private bound - Change error state.
  function handleError(error) {
    var self = this;
    self.error = error;
    if (error) {
      self.errorCount += 1;
    }
    else {
      self.errorCount = 0;
    }
  }

  // private unbound - Start a process.
  function startProcess(self, func) {
    stopProcess(self);   // there can be only one
    self.failCount = 0;
    self.interval = setInterval(func, FETCH_INTERVAL);
  }

  // private unbound - Stop process.
  function stopProcess(self) {
    if (self.interval) {
      clearInterval(self.interval);
      self.interval = 0;
    }
  }

  // private bound - Update my state to reflect the latest from server.
  function handleAResults(results) {
    var userName = results.userName;
    self.userName = userName;
    setState(userName ? STATE_OPERATING : STATE_IDLE);
    self.failCount = 0;
    if (!userName) {
      stopProcess();
    }
    self.actionItems = results.actionItems || [];
  }

  // Get the latest session information from the server.
  function poll() {
    var self = this;
    $.get("/a", {})
    .done(handleAResults.bind(self))
    .fail(handleError.bind(self));
  }

  // Start process of establish connection.
  function startPolling(self) {
    startProcess(poll.bind(self));
  }

  // public - Initiate startup processes.
  function init() {
    var self = this;
    var promise;
    if (self.state == STATE_CONNECTING) {
      promise = this.initPromise;
    }
    else {
      promise = $.Deferred();
      if (self.state == STATE_OPERATING) {
        promise.resolve(self);
      }
      else {
        self.initPromise = promise;
        startPolling(self);
        setState(self, STATE_CONNECTING);
        var timeout = setTimeout(function() {
          self.initPromise = 0;
          promise.reject(self);
          listenerHandle.undo();
        }, INIT_TIMEOUT);
        var listenerHandle = self.addStateChangeListener(function() {
          if (self.state == STATE_OPERATING) {
            clearTimeout(timeout);
            self.initPromise = 0;
            promise.resolve(self);
            listenerHandle.undo();
          }
        });
      }
    }
    return promise;
  }

  // public - Log in with an email address.
  function logInWithEmail(email) {
    var self = this;
    var promise = $.Deferred();
    $.get("/a", { email: email })
    .done(handleAResults.bind(self))
    .done(function(results) {
      if (results.userName) {
        startPolling(self);
        promise.resolve(self);
      }
      else {
        promise.reject(results.error);
      }
    })
    .fail(handleError.bind(self))
    .fail(function() {
      promise.reject(error);
    });
    return promise;
  }

  // bound private - Tell the server we're through.
  function terminate() {
    var self = this;
    $.get("/o", {})
    .done(function() {
      self.failCount = 0;
      stopProcesses(self);
      setState(self, STATE_IDLE);
    })
    .fail(handleError.bind(self));
  }

  // public - Initiate logout process.
  function logOut() {
    var self = this;
    clearCookie();
    self.userName = null;
    setState(self, STATE_LOGGING_OUT);
    startProcess(self, terminate.bind(self));
  }

  Manager.prototype = {
    addStateChangeListener: addStateChangeListener,
    removeStateChangeListener: removeStateChangeListener,
    init: init,
    logInWithEmail: logInWithEmail,
    logOut: logOut
  }

  return {
    STATE_IDLE: STATE_IDLE,
    STATE_CONNECTING: STATE_CONNECTING,
    STATE_OPERATING: STATE_OPERATING,
    STATE_LOGGING_OUT: STATE_LOGGING_OUT,
    Manager: Manager
  }
});
