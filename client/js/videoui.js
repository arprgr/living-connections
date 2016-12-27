// videoui.js - VideoComponent

define([ "jquery", "obs" ], function($, Observable) {

  var DEFAULT_OPTIONS = {
    containerClass: "vid",
    elementId: "theVideo"
  }

  function VideoComponent(container, options) {
    this.container = container;
    this.options = options = $.extend({}, DEFAULT_OPTIONS, options);
    container
      .addClass(options.containerClass)
      // jQuery is unable to handle creation of video elements.
      // TODO: escape the elementId
      .html("<video id='" + options.elementId + "'></video>");
  }

  function setSource(self, src) {
    var promise = $.Deferred();
    var theVideo = self.getVideoElement();

    self.state = new Observable(0);
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

  VideoComponent.prototype = {
    show: function() {
      this.container.show();
      return this;
    },
    hide: function() {
      this.container.hide();
      return this;
    },
    getVideoElement: function() {
      return document.getElementById(this.options.elementId);
    },
    setSource: function(src) {
      return setSource(this, src);
    }
  }

  return VideoComponent;
});
