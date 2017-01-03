// videoui.js - VideoComponent

// Accepts source of either string (URL) or stream.

define([ "jquery", "obs" ], function($, Observable) {

  var DEFAULT_OPTIONS = {
    elementId: "theVideo"
  }

  function VideoComponent(container, options) {
    var self = this;
    self.container = container;
    self.options = options = $.extend({}, DEFAULT_OPTIONS, options);
    self.state = new Observable(0);
    self._visible = true;
    container
      // jQuery is unable to handle creation of video elements.
      // TODO: escape the elementId
      .html("<video id='" + options.elementId + "'></video>");
  }

  function VideoComponent_setVisible(self, visible) {
    visible = !!visible;
    if (self._visible != visible) {
      self._visible = visible;
      visible ? self.element.show() : self.element.hide();
    }
  }

  function VideoComponent_load(self, src) {
    var promise = $.Deferred();
    var theVideo = self.videoElement;

    self.state.setValue(0);
    theVideo.onloadedmetadata = function() {
      self.state.setValue(1);
    }
    theVideo.onerror = function() {
      // Event object contains no useful information.
      self.state.setValue(-1);
    }

    if (src != null) {
      var undoer = self.state.addChangeListener(function() {
        if (self.state.value == 1) {
          promise.resolve(theVideo);
        }
        else {
          promise.reject();
        }
        undoer.undo();
      });
    }

    var srcIsUrl = typeof src == "string";
    theVideo.src = srcIsUrl ? src : "";
    theVideo.srcObject = srcIsUrl ? null : src;
    theVideo.autoplay = !!src && !srcIsUrl;
    theVideo.controls = srcIsUrl;
    theVideo.muted = !srcIsUrl;
    if (src == null) {
      promise.resolve(theVideo);
    }
    return promise;
  }

  VideoComponent.prototype = (function(proto, defineProperty) {

    defineProperty(proto, "visible", {
      get: function() {
        return this._visible;
      },
      set: function(visible) {
        return VideoComponent_setVisible(this, visible);
      }
    });

    defineProperty(proto, "videoElement", {
      get: function() {
        return document.getElementById(this.options.elementId);
      }
    });

    return proto;
  })({
    load: function(src) {
      return VideoComponent_load(this, src);
    }
  }, Object.defineProperty);

  return VideoComponent;
});
