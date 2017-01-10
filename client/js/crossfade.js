// crossfade.js - A cross-fade transition effect.

define([ "jquery", "anim" ], function($, Animation) {

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
