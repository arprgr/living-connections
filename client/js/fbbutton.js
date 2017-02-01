// fbbutton.js - Facebook login/logout button

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      this.container.html('' +
        '<fb:login-button data-size="large" data-auto-logout-link="true">' +
        '</fb:login-button>'
      );
    });
  });
});
