// waitanim.js - WaitAnimController

define([ "jquery", "ui/component" ], function($, Component) {

  function now() {
    return new Date().getTime();
  }

  var FadeDot = Component.defineClass(function(c) {

    function init(fadedot) {
      fadedot.container.html("<canvas></canvas>");
      fadedot.canvas.width = fadedot.options.width;
      fadedot.canvas.height = fadedot.options.height;
    }

    function render(fadedot) {
      var canvas = fadedot.canvas;
      var context = canvas.getContext("2d");
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = Math.min(centerX, centerY);
      var gradient = context.createRadialGradient(75,50,5,90,60,100);
      gradient.addColorStop(0, fadedot.options.color0);
      gradient.addColorStop(1, fadedot.options.color1);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = fadedot.alpha;
      context.beginPath();
      context.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
      context.fillStyle = gradient;
      context.fill();
    }

    function start(fadedot) {
      fadedot.stop();
      fadedot.alpha = 1.0;
      fadedot.startTime = now() + fadedot.options.delay;
      fadedot.interval = setInterval(function() {
        var elapsedTime = now() - fadedot.startTime;
        if (elapsedTime > 0) {
          elapsedTime %= fadedot.options.period;
          fadedot.alpha = Math.max(0, (fadedot.options.duration - elapsedTime) / fadedot.options.duration);
          render(fadedot);
        }
      }, fadedot.options.tick);
    }

    function stop(fadedot) {
      if (fadedot.interval) {
        clearInterval(fadedot.interval);
        fadedot.interval = 0;
        fadedot.alpha = 0.0;
        render(fadedot);
      }
    }

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
      init(this);
    });

    c.defineProperty("canvas", {
      get: function() {
        return this.container[0].children[0];
      }
    });

    c.extendPrototype({
      start: function() {
        start(this);
      },

      stop: function() {
        stop(this);
      }
    });
  });

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

    c.extendPrototype({
      start: function() {
        var self = this;
        for (var i = 0; i < self.dots.length; ++i) {
          self.dots[i].start();
        }
        return self;
      },

      stop: function() {
        var self = this;
        for (var i = 0; i < self.dots.length; ++i) {
          self.dots[i].stop();
        }
        return self;
      }
    });
  });
});
