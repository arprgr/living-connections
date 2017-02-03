// fb.js - Facebook integration service

define([ "jquery", "ui/observable" ], function($, Observable) {

  var CONNECTED = "connected";
  var TIMEOUT = "timeout";
  var WAITING = "waiting";
  var UNKNOWN = "unknown";

  function FacebookService(options) {
    var self = this;
    Observable.call(self);

    self.options = $.extend({
      timeoutPeriod: 10000,
      version: "v2.8"
    }, options);

    // The "value" of this service is a hash of user information: name, email, portrait.
    // Initially empty.
    self.value = {};

    var fbInitOptions = {
      appId  : self.options.appId,
      status : true,
      cookie : true,
      xfbml  : true,
      version: self.options.version
    }

    function onStatusChange(response) {
      console.log("fb status change", response);
    }

    function onAuthResponseChange(response) {
      console.log("fb auth response", response);

      clearTimeout(self.timeout);
      self.timeout = 0;

      self.value.status = response.status;
      self.notifyChangeListeners();

      if (response.status == CONNECTED) {

        FB.api("/me?fields=id,name,email", function(response) {
          console.log("fb response", response);
          self.value.id = response.id;
          self.value.name = response.name;
          self.value.email = response.email;
          self.notifyChangeListeners();
        });

        FB.api('/me/picture?type=normal', function(response) {
          console.log("fb response", response);
          self.value.picture = response.data;
          self.notifyChangeListeners();
        });
      }
      else {
        delete self.value.id;
        delete self.value.name;
        delete self.value.email;
        delete self.value.picture;
      }
    }

    // When Facebook script is loaded, it executes the following.
    window.fbAsyncInit = function() {
      FB.init(fbInitOptions);
      FB.Event.subscribe("auth.statusChange", onStatusChange);
      FB.Event.subscribe("auth.authResponseChange", onAuthResponseChange);
    }
  }

  function FacebookService_open(self) {
    if (!self._sdkLoaded) {
      self._sdkLoaded = true;
      self.value.status = WAITING;

      self.timeout = setTimeout(function() {
        self.timeout = 0;
        self.value.status = TIMEOUT;
        if (self.options.dummy) {
          self.value.status = CONNECTED;
          $.extend(self.value, self.options.dummy);
        }
        self.notifyChangeListeners();
      }, self.options.timeoutPeriod);

      (function(d){
         var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "//connect.facebook.net/en_US/all.js";
         ref.parentNode.insertBefore(js, ref);
      })(document);
    }
    return self;
  }

  FacebookService.prototype = $.extend(Object.create(Observable.prototype), {

    CONNECTED: CONNECTED,
    TIMEOUT: TIMEOUT,
    WAITING: WAITING,
    UNKNOWN: UNKNOWN,

    open: function() {
      return FacebookService_open(this);
    }
  });

  return FacebookService;
});
