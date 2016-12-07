// session.js

define([ "jquery", "cookie", "http", "obs" ], function($, Cookie, HttpMethod, Observable) {

  var FETCH_INTERVAL = 5000;
  var TRIES = 3;

  var ACTION_POLL_METHOD = new HttpMethod("/a?_=%salt%");
  var LOGIN_METHOD = new HttpMethod("/a?email=%email%&_=%salt%");
  var LOGOUT_METHOD = new HttpMethod("/o/%sid%?_=%salt%");

  function Manager() {
    var self = this;

    self.responseCount = 0;
    self.errorCount = 0;
    self.localErrorCount = 0;

    // The session manager notifies listeners of general state changes.
    self.state = new Observable(self);

    // The session manager maintains the current list of action items, and notifies
    // listeners of changes.
    self.actionItems = new Observable([]);

    self.cookie = new Cookie("s");
  }

  // Not yet logged in, or explicitly logged out.
  function isLoginRequired() {
    var self = this;
    return self.responseCount > 0 && !this.user;
  }

  // In application mode.
  function isActive() {
    var self = this;
    return self.cookie.get() && self.user;
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
      for (var i = 0; i < actionItems.length; ++i) {
        actionItems[i].titleFormat = actionItems[i].type;
      }
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
        ACTION_POLL_METHOD.execute({
        }, function(results) {
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
    return self;
  }

  // public - Log in with an email address.
  function logInWithEmail(email) {
    var self = this;
    stopPolling(self);
    self.user = null;
    var promise = $.Deferred();
    LOGIN_METHOD.execute({
      email: email
    }, function(response) {
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
    var sid = self.cookie.get();
    if (sid) {
      LOGOUT_METHOD.execute({ sid: sid });
      self.cookie.clear();
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

  return Manager;
});
