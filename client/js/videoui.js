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
      .hide()
      .addClass(options.containerClass)
      .html("<video id='" + options.elementId + "'></video>");
  }

  function setSource(self, src) {
    var promise = $.Deferred();
    var theVideo = self.getVideoElement();

    if (!self.state) {
      self.state = new Observable(0);
      theVideo.onloadedmetadata = function() {
        self.state.setValue(1);
      }
    }
    self.state.setValue(0);

    if (src != null) {
      var undoer = self.state.addChangeListener(function() {
        promise.resolve(theVideo);
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
    setVisible: function(visible) {
      this.container.setVisible(visible);
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
