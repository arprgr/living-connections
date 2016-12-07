// fadedot.js

define([ "jquery" ], function($) {

  function now() {
    return new Date().getTime();
  }

  // Animation constants.
  var DURATION = 780;
  var TICK = 25;

  function Controller(canvasId) {
    this.canvasId = canvasId;
  }

  function render(self) {
    var canvas = document.getElementById(self.canvasId);
    if (canvas) {
      var context = canvas.getContext("2d");
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = Math.min(centerX, centerY);
      var gradient = context.createRadialGradient(75,50,5,90,60,100);
      gradient.addColorStop(0, "white");
      gradient.addColorStop(1, "green");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = self.alpha;
      context.beginPath();
      context.arc(centerX, centerY, 5, 0, 2 * Math.PI, false);
      context.fillStyle = gradient;
      context.fill();
    }
  }

  function tick(self) {
    var elapsedTime = now() - self.startTime;
    if (elapsedTime > DURATION) {
      self.stop();
    }
    else {
      self.alpha = (DURATION - elapsedTime) / DURATION;
      render(self);
    }
  }

  function start() {
    var self = this;
    self.stop();
    self.alpha = 1.0;
    render(self);
    self.running = true;
    self.startTime = now();
    setInterval(function() { tick(self); }, TICK);
  }

  function stop() {
    var self = this;
    if (self.running) {
      clearInterval(self.interval);
      self.running = false;
      self.alpha = 0.0;
      render(self);
    }
  }

  Controller.prototype = {
    start: start,
    stop: stop
  }

  return Controller;
});
