// bootui.js

define([ "jquery" ], function($) {

  // Animation constants.
  const NDOTS = 7;
  const DOT = "dot";
  const PERIOD = 750;
  const TICK = 25;
  const TICKS_PER_FADE = 1300 / TICK;

  function dotId(ix) {
    return DOT + ix;
  }

  function renderDots(container) {
    for (var i = 0; i < NDOTS; ++i) {
      $("<canvas>").attr("id", dotId(i)).attr("width", 18).attr("height", 18).addClass(DOT).appendTo(container);
    }
  }

  function now() {
    return new Date().getTime();
  }

  function drawCircle(canvasId, alpha) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY);
    var gradient = context.createRadialGradient(75,50,5,90,60,100);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "green");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
    context.fillStyle = gradient;
    context.fill();
  }

  function Animation(container) {
    this.container = container;
    this.intervals = [];
  }

  function startNextAnimation(self) {
    var ix = self.intervals.length;
    var canvasId = dotId(ix);
    var startTime = now();

    function step() {
      var elapsedTime = now() - startTime;
      var frameIndex = (elapsedTime % (PERIOD * NDOTS)) / TICK;
      var alpha = Math.max(0, (TICKS_PER_FADE - frameIndex) / TICKS_PER_FADE);
      drawCircle(canvasId, alpha);
    }

    step();
    self.intervals.push(setInterval(step, TICK));
  }

  function startAnimation() {
    var self = this;
    renderDots(self.container);
    (function kickOffNext() {
      if (self.intervals && self.intervals.length < NDOTS) {
        startNextAnimation(self);
        setTimeout(kickOffNext, PERIOD);
      }
    })();
    return self;
  }

  function stopAnimation() {
    var self = this;
    var intervals = self.intervals;
    for (var i in intervals) {
      clearInterval(intervals[i]);
    }
    self.intervals = null;
    self.container.empty();
    return self;
  }

  Animation.prototype = {
    start: startAnimation,
    stop: stopAnimation
  }

  return {
    Animation: Animation
  }
});
