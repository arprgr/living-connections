// image.js - Image component.

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container.html("<img></img>");
    });

    c.defineProperty("imageElement", {
      get: function() {
        return this.container[0].children[0];
      }
    });

    c.defineProperty("src", {
      get: function() {
        return this.imageElement.src;
      },
      set: function(src) {
        this.imageElement.src = src;
      }
    });
  });
});
