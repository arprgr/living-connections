// fb.js - Facebook Login

define([ "jquery", "ui/index" ], function($, ui) {

  var status;
  var userInfo;
  var picture;
 
  function getUserInfo() {
    FB.api("/me?fields=id,name,email,birthday", function(response) {
      userInfo = response;
      console.log("FB info", response);
    });

    FB.api('/me/picture?type=normal', function(response) {
      picture = response.data.url;
      console.log("FB picture", response);
    });
  }

  window.fbAsyncInit = function() {

    FB.init({
      appId      : '1093072224140701', // Set YOUR APP ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
      version    : 'v2.8' // use graph api version 2.8
    });

    var AUTH_EVT = "auth.authResponseChange";
    
    FB.Event.subscribe(AUTH_EVT, function(response) {
      console.log("FB", AUTH_EVT, reponse);
      status = response.status;
      if (status == "connected") {
        connected = true;
        getUserInfo();
      }
    });
  };

  // Load the SDK asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
  })(document);

  return ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      this.container.append($("<div>")
        .html('' +
          '<fb:login-button scope="email,user_photos,user_videos,user_likes,user_location,user_birthday,publish_pages" data-auto-logout-link="true" data-auto-logout-link="true">' +
          '</fb:login-button>'
        ));
    });
  });
});
