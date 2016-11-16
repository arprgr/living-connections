// anim.js

define([ "jquery" ], function($) {

  const TICK = 25;
  const DEFAULT_PERIOD = 1000;

  var DEFAULT_ANIMATION_OPTIONS = {
    period: DEFAULT_PERIOD
  };

  function now() {
    return new Date().getTime();
  }

  function Animation(options) {
    var self = this;
    self.options = $.extend({}, DEFAULT_ANIMATION_OPTIONS, options);
    self.startTime = now();
  }

  function startAnimation() {
    var self = this;
    self.interval = setInterval(function() {
      animationStep(self);
    }, TICK);
    self.renderInitial();
    return self;
  }

  function animationStep(animation) {
    var elapsedTime = now() - animation.startTime;
    var frameIndex = (elapsedTime % animation.options.period) / TICK;
    animation.renderTween(frameIndex);
  }

  function stopAnimation() {
    var self = this;
    clearInterval(self.interval);
    self.interval = 0;
    self.renderFinal();
    return self;
  }

  Animation.prototype = {
    renderInitial: function() {},
    renderTween: function() {},
    renderFinal: function() {},
    start: startAnimation,
    stop: stopAnimation
  }

  function AnimationGroup() {
    this.animations = [];
  }

  function addAnimation(animation) {
    var self = this;
    self.animations.push(animation);
  }

  function stopAnimationGroup() {
    var self = this;
    for (var i in self.animations) {
      self.animations[i].stop();
    }
    return self;
  }

  AnimationGroup.prototype = {
    addAnimation: addAnimation,
    start: function() { return this; },
    stop: stopAnimationGroup
  }

  return {
    Animation: Animation,
    AnimationGroup: AnimationGroup
  }
});
