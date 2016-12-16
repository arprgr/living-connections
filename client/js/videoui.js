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
      .html("<video id='" + options.elementId + "'></video>");
  }

  function setSource(self, src) {
    var theVideo = self.getVideoElement();
    var srcIsUrl = typeof src == "string";
    theVideo.src = srcIsUrl ? src : "";
    theVideo.srcObject = srcIsUrl ? null : src;
    theVideo.autoplay = !!src && !srcIsUrl;
    theVideo.controls = srcIsUrl;
    theVideo.muted = !srcIsUrl;
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
