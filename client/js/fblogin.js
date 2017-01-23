// fblogin.js - Facebook login component

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      this.container.append($("<div>")
        .html('' +
          '<fb:login-button scope="email,user_photos,user_videos,user_likes,user_location,user_birthday,publish_pages" data-auto-logout-link="true">' +
          '</fb:login-button>'
        ));
    });
  });
});
