// session.js

define([ "jquery", "error" ], function($, error) {

  // Manager is in one of the following states....
  var STATE_IDLE = 0;
  var STATE_CONNECTING = 1;
  var STATE_OPERATING = 2;

  var FETCH_INTERVAL = 5000;
  var INIT_TIMEOUT = 10000;

  var COOKIE_NAME = "s";

  function clearCookie() {
    document.cookie = COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  function get(url, handleDone, handleError) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
      if (req.status === 200) {
        if (handleDone) {
          handleDone(JSON.parse(req.responseText));
        }
      }
      else {
        if (handleError) {
          handleError(new Error("status " + req.status));
        }
      }
    });
    if (handleError) {
      req.addEventListener("error", function(e) {
        handleError(e);
      });
    }
    req.open("GET", url);
    req.send();
  }

  // Manager constructor.
  function Manager() {
    var self = this;

    // state is initially undefined.
    self.actionItems = [];
    self.stateChangeListeners = [];
    self.errorListeners = [];
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

  // private - Notify state change listeners.
  function notifyStateChangeListeners(self) {
    for (var i = 0; i < self.stateChangeListeners.length; ++i) {
      self.stateChangeListeners[i](self);
    }
  }

  // private - Change state.
  function setState(self, state) {
    if (state != self.state) {
      self.state = state;
      notifyStateChangeListeners(self);
    }
  }

  // private - Start the process of pulling the latest session info from the server.
  function startPolling(self) {
    if (!self.interval) {
      function poll() {
        get("/a", function(results) {
          handleAResults(self, results);
        });
      }
      poll();
      self.interval = setInterval(poll, FETCH_INTERVAL);
    }
  }

  // private - Stop process.
  function stopPolling(self) {
    if (self.interval) {
      clearInterval(self.interval);
      self.interval = 0;
    }
  }

  // private - Update my state to reflect the latest from server.
  function handleAResults(self, results) {
    var userName = results.userName;
    self.userName = userName;
    setState(self, userName ? STATE_OPERATING : STATE_IDLE);
    userName ? startPolling(self) : stopPolling(self);
    self.actionItems = results.actionItems || [];
  }

  // public - Initiate startup processes.
  function init() {
    var self = this;
    var promise;
    var timeout, listenerHandle;
    switch (self.state) {
    case STATE_CONNECTING:
      promise = this.initPromise;
      break;
    case STATE_OPERATING:
      promise = $.Deferred().resolve(self);
      break;
    default:
      self.initPromise = promise = $.Deferred();
      startPolling(self);
      setState(self, STATE_CONNECTING);
      listenerHandle = self.addStateChangeListener(function() {
        switch (self.state) {
        case STATE_OPERATING:
        case STATE_IDLE:
          clearTimeout(timeout);
          promise.resolve(self);
          self.initPromise = 0;
        }
        listenerHandle.undo();
      });
      timeout = setTimeout(function() {
        self.initPromise = 0;
        stopPolling(self);
        promise.reject(new Error(error.codes.STARTUP_ERROR_TIMEOUT));
        listenerHandle.undo();
      }, INIT_TIMEOUT);
    }
    return promise;
  }

  // public - Log in with an email address.
  function logInWithEmail(email) {
    var self = this;
    stopPolling(self);
    var promise = $.Deferred();
    get("/a?email=" + encodeURIComponent(email), function(response) {
      handleAResults(self, response);
      if (self.userName) {
        promise.resolve(self);
      }
      else {
        promise.reject("Login failed.");
      }
    }, function(error) {
      promise.reject("Login failed.");
    });
    return promise;
  }

  // public - Initiate logout process.
  function logOut() {
    var self = this;
    get("/o");    // One last use of the cookie.
    clearCookie();
    self.userName = null;
    setState(self, STATE_IDLE);
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
    Manager: Manager
  }
});
