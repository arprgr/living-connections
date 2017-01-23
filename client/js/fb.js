// fb.js - Facebook integration service

define([ "ui/observable" ], function(Observable) {

  function FacebookService(options) {
    var self = this;

    self.options = options;
    self.status = new Observable();
    self.userInfo = new Observable();
    self.picture = new Observable();

    window.fbAsyncInit = function() {

      FB.init({
        appId  : self.options.appId,
        status : true,
        cookie : true,
        xfbml  : true,
        version: self.options.version || "v2.8"
      });

      FB.Event.subscribe("auth.authResponseChange", function(response) {

        console.log(response);

        self.status.value = response.status;
        self.userInfo.value = null;
        self.picture.value = null;

        if (response.status == "connected") {
          FB.api("/me?fields=id,name,email,birthday", function(response) {
            console.log(response);
            self.userInfo.value = response;
          });

          FB.api('/me/picture?type=normal', function(response) {
            console.log(response);
            self.picture.value = response.data;
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

  FacebookService.prototype.open = function() {
    var self = this;
    if (!self._sdkLoaded) {
      self._sdkLoaded = true;
      loadSdkAsync();
    }
    return self;
  };

  return FacebookService;
});
