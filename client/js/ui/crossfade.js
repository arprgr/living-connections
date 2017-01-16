// crossfade.js - A cross-fade transition effect.

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

  function Animation(options) {
    var self = this;
    self.options = $.extend({}, DEFAULT_ANIMATION_OPTIONS, options);
  }

  Animation.prototype = {
    start: function() {
      var self = this;
      self.startTime = now();
      self.interval = setInterval(function() {
        animationStep(self);
      }, self.options.tick);
      self.options.renderInitial();
      return self;
    },
    stop: function() {
      var self = this;
      clearInterval(self.interval);
      self.interval = 0;
      self.options.renderFinal();
      return self;
    }
  }

  var DEFAULT_OPTIONS = {
    duration: 1800
  }

  function setComponentOpacity(component, opacity) {
    component.container.css("opacity", opacity);
  }

  function CrossFade(theOldComponent, theNewComponent, options) {
    this.options = $.extend({}, DEFAULT_OPTIONS, options);
    this.theOldComponent = theOldComponent;
    this.theNewComponent = theNewComponent;
  }

  CrossFade.prototype = {
    run: function() {
      var self = this;
      var theOldComponent = self.theOldComponent;
      var theNewComponent = self.theNewComponent;
      var duration = self.options.duration;
      var promise = $.Deferred();

      function adjustOpacity(elapsed) {
        var x = elapsed / duration;
        x = Math.PI/2 * x*x;
        setComponentOpacity(theOldComponent, Math.cos(x));
        setComponentOpacity(theNewComponent, Math.sin(x));
      }

      new Animation({
        period: duration,
        frameTime: 1,
        iterations: 1,
        renderInitial: function() {
          adjustOpacity(0);
          theOldComponent.visible = true;
          theNewComponent.visible = true;
        },
        renderTween: adjustOpacity,
        renderFinal: function() {
          adjustOpacity(duration);
          theOldComponent.visible = false;
          promise.resolve();
        }
      }).start();
      return promise;
    }
  }

  return CrossFade;
});
