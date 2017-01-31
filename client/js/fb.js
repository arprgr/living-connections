// fb.js - Facebook integration service

define([ "ui/observable" ], function(Observable) {

  var CONNECTED = "connected";

  function FacebookService(options) {
    var self = this;
    Observable.call(self);

    window.fbAsyncInit = function() {

      console.log("running fbAsyncInit");

      FB.init({
        appId  : options.appId,
        status : true,
        cookie : true,
        xfbml  : true,
        version: options.version || "v2.8"
      });

      FB.Event.subscribe("auth.authResponseChange", function(response) {

        console.log("fb response", response);

        clearTimeout(self.timeout);
        self.timeout = 0;

        self.value = { status: response.status };
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
      });
    };
  }

  function loadSdkAsync() {
    (function(d){
       var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement('script'); js.id = id; js.async = true;
       js.src = "//connect.facebook.net/en_US/all.js";
       ref.parentNode.insertBefore(js, ref);
    })(document);
  }

  function timedOut(self) {
    self.value = { status: "timeout" };
    self.timeout = 0;
  }

  FacebookService.prototype = (function() {
    var proto = Object.create(Observable.prototype);
    proto.open = function() {
      var self = this;
      if (!self._sdkLoaded) {
        self._sdkLoaded = true;
        self.timeout = setTimeout(function() { timedOut(self); }, 10000);
        loadSdkAsync();
      }
      return self;
    };
    proto.CONNECTED = CONNECTED;
    return proto;
  })();

  return FacebookService;
});
