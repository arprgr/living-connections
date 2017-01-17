// fb.js - Facebook Login

define([ "jquery", "ui/index" ], function($, ui) {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1093072224140701', // Set YOUR APP ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
      version    : 'v2.8' // use graph api version 2.8
    });

  var connected;
    
    
  FB.Event.subscribe('auth.authResponseChange', function(response) 
  {
    
   if (response.status === 'connected') 
    {
      connected = true;
      console.log("connected to FB");
      getUserInfo();
    }  
  else if (response.status === 'not_authorized') 
    {
      connected = false;
      console.log("failed to connect to FB");

    //FAILED
    } else 
    {
      connected = false;
      console.log("logged out of FB");
    }
  }); 
  
    };
    
    function Login()
  {
  
    FB.login(function(response) {
       if (response.authResponse) 
       {
          getUserInfo();
          //angular.element(document.getElementById('login')).scope().handleFBLogin();
        } else 
        {
           console.log('User cancelled login or did not fully authorize.');
        }
     },{scope: 'email,user_photos,user_videos,user_likes,user_location,user_birthday,publish_pages'});
  
  
  }

  function getUserInfo() {
      FB.api('/me?fields=id,name,email,birthday', function(response) {
        console.log("FB info", response.name, response.id, response.email, response.birthday);
    });

      FB.api('/me/picture?type=normal', function(response) {
       console.log("FB image", response.data.url);
      });
    }

  function LoginAs()
  {
    FB.logout(function(){
     FB.login(function(response) {
       if (response.authResponse) 
       {
         // angular.element(document.getElementById('login')).scope().handleFBLogin();
        } else 
        {
           console.log('User cancelled login or did not fully authorize.');
        }
     },{scope: 'email,user_photos,user_videos,user_likes,user_location,user_birthday,publish_pages'});
    });
  }

 function continueToLC () {
   
  angular.element(document.getElementById('login')).scope().handleFBLogin();

 }

function sendFBPost () {
 FB.ui({
  method: 'feed',
  name: 'Living Connections an exciting new app!',
  link: 'https://calm-thicket-20746.herokuapp.com/#/home',
  caption: 'Living Connections',
  description: 'Giving and receving care will never be the same!'
}, function(response){});
}

  // Load the SDK asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));


  return ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {

      var self = this;

      self.container
        .append(ui.Button.create("Continue With Current FB", function() {
          continueToLC();
        }))
        .append(ui.Button.create("Login as another", function() {
          LoginAs();
        }))
        .append($("<div>").html('' +
          '<fb:login-button scope="email,user_photos,user_videos,user_likes,user_location,user_birthday,publish_pages" data-auto-logout-link="true" data-auto-logout-link="true">' +
          '</fb:login-button>'
        ));
    });
  });
});
