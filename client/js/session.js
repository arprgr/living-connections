// session.js

define([ "jquery", "obs" ], function($, obs) {

  // Session cookie functions.

  var COOKIE_NAME = "s";

  function getSessionCookie() {
    var value = "; " + document.cookie;
    var parts = value.split("; " + COOKIE_NAME + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  function clearSessionCookie() {
    document.cookie = COOKIE_NAME + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  // AJAX functions.

  function salt() {
    return String(Math.floor(0xffffffff * Math.random()));
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

  // Class session.Manager.

  var FETCH_INTERVAL = 5000;
  var TRIES = 3;

  function Manager() {
    var self = this;

    self.responseCount = 0;
    self.errorCount = 0;
    self.localErrorCount = 0;

    // The session manager notifies listeners of general state changes.
    self.state = new obs.Observable(self);

    // The session manager maintains the current list of action items, and notifies
    // listeners of changes.
    self.actionItems = new obs.Observable([]);
  }

  // Not yet logged in, or explicitly logged out.
  function isLoginRequired() {
    var self = this;
    return self.responseCount > 0 && !this.user;
  }

  // In application mode.
  function isActive() {
    return getSessionCookie() && this.user;
  }

  // Unresponsive (regardless of mode).
  function isUnresponsive() {
    return this.localErrorCount >= TRIES;
  }

  // public - Add a state change listener.
  function addStateChangeListener(listener) {
    return this.state.addChangeListener(listener);
  }

  // private - Notify state change listeners.
  function notifyStateChangeListeners(self) {
    self.state.notifyChangeListeners();
  }

  // public - Add an action listener.
  function addActionListener(listener) {
    return this.actionItems.addChangeListener(listener);
  }

  // private - Notify action listeners.
  function notifyActionListeners(self) {
    self.actionItems.notifyChangeListeners();
  }

  // private - Update state to reflect a valid response from server.
  function handleAResults(self, results) {
    self.responseCount += 1;
    self.localErrorCount = 0;
    self.waiting = false;

    var userName = results.userName;
    if (userName) {
      if (!self.user) {
        self.user = {};
      }
      self.user.name = userName;
      // TODO: additional user info 
    }

    userName ? startPolling(self) : stopPolling(self);

    var actionItems = results.actionItems;
    if (actionItems) {
      // TODO: do differencing
      self.actionItems.value = actionItems;
      notifyActionListeners(self);
    }

    // Then trigger handlers that observe the model.
    notifyStateChangeListeners(self);
  }

  // private - Update state to reflect an error, either network or backend.
  function handleAError(self, error) {
    self.errorCount += 1;
    self.localErrorCount += 1;
    console.log(error);
    if (self.isUnresponsive()) {
      self.waiting = false;
    }
    notifyStateChangeListeners(self);
  }

  // private - Start the process of pulling the latest session info from the server.
  function startPolling(self) {
    if (!self.pollInterval) {
      function poll() {
        get("/a?_=" + salt(), function(results) {
          handleAResults(self, results);
        }, function(error) {
          handleAError(self, error);
        });
      }
      poll();
      self.pollInterval = setInterval(poll, FETCH_INTERVAL);
    }
  }

  // private - Stop process.
  function stopPolling(self) {
    if (self.pollInterval) {
      clearInterval(self.pollInterval);
      self.pollInterval = 0;
    }
  }

  // public - Initiate startup processes.
  function init() {
    var self = this;
    if (!self.responseCount) {
      self.waiting = true;
      startPolling(self);
      notifyStateChangeListeners(self);
    }
  }

  // public - Log in with an email address.
  function logInWithEmail(email) {
    var self = this;
    stopPolling(self);
    self.user = null;
    var promise = $.Deferred();
    get("/a?email=" + encodeURIComponent(email) + "&_=" + salt(), function(response) {
      handleAResults(self, response);
      if (self.user) {
        promise.resolve(self);
      }
      else {
        promise.reject("Login failed.");
      }
    }, function(error) {
      handleAError(self, error);
      promise.reject("Can't reach server.");
    });
    notifyStateChangeListeners(self);
    return promise;
  }

  // public - Initiate logout process.
  function logOut() {
    var self = this;
    self.user = null;
    var sid = getSessionCookie();
    if (sid) {
      get("/o/" + encodeURIComponent(sid) + "?_=" + salt());
      clearSessionCookie();
    }
    notifyStateChangeListeners(self);
  }

  Manager.prototype = {
    addStateChangeListener: addStateChangeListener,
    addActionListener: addActionListener,
    isLoginRequired: isLoginRequired,
    isActive: isActive,
    isUnresponsive: isUnresponsive,
    init: init,
    logInWithEmail: logInWithEmail,
    logOut: logOut
  }

  return {
    Manager: Manager
  }
});
