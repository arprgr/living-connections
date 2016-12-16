// videoui.js - VideoComponent

define([ "jquery" ], function($) {

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
      .html("<video id='" + options.elementId + "' autoplay></video>");
  }

  function setSource(self, src) {
    var theVideo = self.getVideoElement();
    if (src == null) {
      theVideo.src = "";
      theVideo.srcObject = null;
      theVideo.autoplay = false;
      theVideo.controls = false;
    }
    else if (typeof src == "string") {
      theVideo.src = src;
      theVideo.srcObject = null;
      theVideo.autoplay = false;
      theVideo.controls = true;
    }
    else {
      theVideo.src = "";
      theVideo.srcObject = src;
      theVideo.autoplay = true;
      theVideo.controls = false;
    }
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
