// videoui.js - VideoComponent

// Accepts source of either string (URL) or stream.

define([ "jquery", "component", "obs" ], function($, Component, Observable) {

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      elementId: "theVideo"
    });

    c.defineInitializer(function() {
      var self = this;
      self.state = new Observable(0);
      // jQuery is unable to handle creation of video elements.
      // TODO: escape the elementId
      self.container.html("<video id='" + self.options.elementId + "'></video>");
    });

    c.defineFunction("load", function(src) {
      var self = this;
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
    });

    c.defineFunction("clear", function() {
      return this.load(null);
    });

    c.defineFunction("pause", function() {
      this.videoElement.pause();
      return this;
    });

    c.defineProperty("videoElement", {
      get: function() {
        return document.getElementById(this.options.elementId);
      }
    });
  });
});
