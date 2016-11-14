// bootui.js

define([ "jquery" ], function($) {

  var NDOTS = 5;
  var PERIOD = 750;
  var TICK = 25;
  var TICKS_PER_FADE = 1300 / TICK;

  var DOT = "dot";
  var DOTS = "dots";
  var STARTUP_SCREEN = "startupScreen";

  function dotId(ix) {
    return DOT + ix;
  }

  function render() {

    var dotsDiv = $("<div>").addClass(DOTS);

    $("body").append($("<div>")
      .addClass(STARTUP_SCREEN)
      .append($("<div>").addClass("logo"))
      .append(dotsDiv)
    );

    for (var i = 0; i < NDOTS; ++i) {
      dotsDiv.append($("<canvas>").attr("id", dotId(i)).attr("width", 18).attr("height", 18).addClass(DOT));
    }
  }

  function erase() {
    $("." + STARTUP_SCREEN).remove();
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

  function Animation() {
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
    (function kickOffNext() {
      if (self.intervals && self.intervals.length < NDOTS) {
        startNextAnimation(self);
        setTimeout(kickOffNext, PERIOD);
      }
    })();
  }

  function stopAnimation() {
    var self = this;
    var intervals = self.intervals;
    for (var i in intervals) {
      clearInterval(intervals[i]);
    }
    self.intervals = null;
  }

  Animation.prototype = {
    start: startAnimation,
    stop: stopAnimation
  }

  return {
    render: render,
    erase: erase,
    Animation: Animation
  }
});
