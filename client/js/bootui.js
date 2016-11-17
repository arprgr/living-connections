// bootui.js

define([ "jquery", "anim" ], function($, anim) {

  // Animation constants.
  var NDOTS = 7;
  var DOT = "dot";
  var PAUSE = 400;
  var PERIOD = PAUSE * NDOTS;
  var FRAMES_PER_FADE = 24;

  function DotAnimation(container, canvasId) {
    var self = this;
    self.canvasId = canvasId;
    anim.Animation.call(self, { period: PERIOD });

    $("<canvas>")
      .attr("id", canvasId)
      .attr("width", 18)
      .attr("height", 18)
      .addClass(DOT)
      .appendTo(container);
  }

  function renderInitialDot() {
    var self = this;
    self.render(1.0);
  }

  function renderTweenDot(frameIndex) {
    var self = this;
    var alpha = Math.max(0, FRAMES_PER_FADE - frameIndex);
    self.render(alpha);
  }

  function renderDot(alpha) {
    var self = this;
    var canvasId = self.canvasId;
    var canvas = document.getElementById(canvasId);
    if (canvas) {
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
  }

  function renderFinalDot() {
    var self = this;
    $("#" + self.canvasId).remove();
  }

  DotAnimation.prototype = $.extend({}, anim.Animation.prototype, {
    renderInitial: renderInitialDot,
    renderTween: renderTweenDot,
    renderFinal: renderFinalDot,
    render: renderDot
  });

  function WaitingAnimation(container) {
    var self = this;
    self.container = container;
    anim.AnimationGroup.call(self);
  }

  function startWaitingAnimation() {
    var self = this;
    (function kickOffNext() {
      var ix = self.animations.length;
      if (ix < NDOTS) {
        self.addAnimation(new DotAnimation(self.container, DOT + ix).start());
        self.timeout = setTimeout(kickOffNext, PAUSE);
      }
    })();
    return self;
  }

  function stopWaitingAnimation() {
    var self = this;
    clearTimeout(self.timeout);
    anim.AnimationGroup.prototype.stop.call(self);
  }

  WaitingAnimation.prototype = $.extend({}, anim.AnimationGroup.prototype, {
    start: startWaitingAnimation,
    stop: stopWaitingAnimation
  });

  return {
    WaitingAnimation: WaitingAnimation
  }
});
