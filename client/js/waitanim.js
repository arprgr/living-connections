// waitanim.js - WaitAnimController

define([ "jquery", "component", "fadedot" ], function($, Component, FadeDot) {

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      ndots: 7
    });

    c.defineInitializer(function() {
      var self = this;
      self.dots = [];
      for (var i = 0; i < self.options.ndots; ++i) {
        var fadedot = new FadeDot($("<span>"), {
          period: self.options.ndots * 500,
          delay: i * 500
        });
        self.dots.push(fadedot);
        self.container.append(fadedot.container);
      }
    });

    c.defineFunction("start", function() {
      var self = this;
      for (var i = 0; i < self.dots.length; ++i) {
        self.dots[i].start();
      }
      return self;
    });

    c.defineFunction("stop", function() {
      var self = this;
      for (var i = 0; i < self.dots.length; ++i) {
        self.dots[i].stop();
      }
      return self;
    });
  });
});
