// fbbutton.js - Facebook login/logout button

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      size: "large"
    });

    var TMPL = '<fb:login-button data-size="%size%" data-auto-logout-link="true"></fb:login-button>';

    c.defineInitializer(function() {
      this.container.html(TMPL.replace("%size%", this.options.size));
    });
  });
});
