// fadedot.js

define([ "jquery", "component" ], function($, Component) {

  function now() {
    return new Date().getTime();
  }

  function render(self) {
    var canvas = self.canvas;
    var context = canvas.getContext("2d");
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY);
    var gradient = context.createRadialGradient(75,50,5,90,60,100);
    gradient.addColorStop(0, self.options.color0);
    gradient.addColorStop(1, self.options.color1);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = self.alpha;
    context.beginPath();
    context.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
    context.fillStyle = gradient;
    context.fill();
  }

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      delay: 0,
      period: 2500,
      duration: 1000,
      tick: 20,
      color0: "white",
      color1: "green",
      width: 50,
      height: 50
    });

    c.defineInitializer(function() {
      var self = this;
      // Is jQuery able to handle creation of canvas elements?
      self.container.html("<canvas></canvas>");
      self.canvas.width = self.options.width;
      self.canvas.height = self.options.height;
    });

    c.defineProperty("canvas", {
      get: function() {
        return this.container[0].children[0];
      }
    });

    c.defineFunction("start", function() {
      var self = this;
      self.stop();
      self.alpha = 1.0;
      self.startTime = now() + self.options.delay;
      self.interval = setInterval(function() {
        var elapsedTime = now() - self.startTime;
        if (elapsedTime > 0) {
          elapsedTime %= self.options.period;
          self.alpha = Math.max(0, (self.options.duration - elapsedTime) / self.options.duration);
          render(self);
        }
      }, self.options.tick);
    });

    c.defineFunction("stop", function() {
      var self = this;
      if (self.interval) {
        clearInterval(self.interval);
        self.interval = 0;
        self.alpha = 0.0;
        render(self);
      }
    });
  });
});
