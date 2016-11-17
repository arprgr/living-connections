// anim.js

define([ "jquery" ], function($) {

  const DEFAULT_TICK = 20;
  const DEFAULT_FRAME_TIME = 50;
  const DEFAULT_PERIOD = 1000;

  var DEFAULT_ANIMATION_OPTIONS = {
    period: DEFAULT_PERIOD,
    tick: DEFAULT_TICK,
    frameTime: DEFAULT_FRAME_TIME,
    iterations: 0,
    renderInitial: function(){},
    renderTween: function(){},
    renderFinal: function(){}
  };

  function now() {
    return new Date().getTime();
  }

  function Animation(options) {
    var self = this;
    self.options = $.extend({}, DEFAULT_ANIMATION_OPTIONS, options);
  }

  function startAnimation() {
    var self = this;
    self.startTime = now();
    self.interval = setInterval(function() {
      animationStep(self);
    }, self.options.tick);
    self.options.renderInitial();
    return self;
  }

  function animationStep(animation) {
    var options = animation.options;
    var elapsedTime = now() - animation.startTime;
    var iteration = Math.floor(elapsedTime / options.period);
    var frameIndex = Math.floor((elapsedTime % options.period) / options.frameTime);
    if (options.iterations <= 0 || iteration < options.iterations) {
      animation.options.renderTween(frameIndex);
    }
    else {
      animation.stop();
    }
  }

  function stopAnimation() {
    var self = this;
    clearInterval(self.interval);
    self.interval = 0;
    self.options.renderFinal();
    return self;
  }

  Animation.prototype = {
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
