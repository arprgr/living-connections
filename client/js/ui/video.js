// video.js - Video component.
// Sourced by either string (URL) or stream.
// Has custom controls.

define([ "jquery", "ui/button", "ui/component" ], function($, Button, Component) {

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      cssClass: "video"
    });

    function initControls(self) {

      function playOrPause() {
        var video = self.videoElement;
        if (video.paused) {
          video.play();
          self.playPauseButton.text = "Pause";
        }
        else {
          video.pause();
          self.playPauseButton.text = "Play";
        }
      }

      self.playPauseButton = Button.create("Play", playOrPause);

      function fullScreen() {
        var video = self.videoElement;
        //options based on browser
        if(video.requestFullScreen) {
          video.requestFullScreen;
        } else if(video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if(video.webkitRequestFullScreen) {
          video.webkitRequestFullScreen();
        }
      }

      self.fullScreenButton = Button.create("Full Screen", fullScreen);
    }

    // The outer element is usually a div.  The div contains two elements: the video and a container
    // for controls.
    c.defineInitializer(function() {
      var self = this;
      initControls(self);
      // jQuery is unable to handle creation of video elements.
      self.ele.html("<video></video>");
      self.ele.append($("<div>")
        .addClass("controls")
        .append(self.playPauseButton.ele)
        .append(self.fullScreenButton.ele) );
    });

    c.extendPrototype({
      load: function(src, options) {
        var self = this;
        options = options || {};
        var promise = $.Deferred();
        var theVideo = self.videoElement;

        theVideo.onloadedmetadata = function() {
          // Set the width of the container to match the intrinsic width of the video.
          // This enables us to center the container using margin: auto.
          self.ele.css("width", theVideo.videoWidth);
          promise.resolve(theVideo);
        }
        theVideo.onerror = function() {
          // Event object contains no useful information.
          promise.reject();
        }

        var srcIsUrl = typeof src == "string";
        theVideo.src = srcIsUrl ? src : "";
        theVideo.srcObject = srcIsUrl ? null : src;
        theVideo.autoplay = options.autoplay || (!!src && !srcIsUrl);
        theVideo.muted = !srcIsUrl;
        self.playPauseButton.visible = srcIsUrl;
        self.fullScreenButton.visible = srcIsUrl;
        if (src == null) {
          promise.resolve(theVideo);
        }
        return promise;
      },

      clear: function() {
        return this.load(null);
      },

      pause: function() {
        this.videoElement.pause();
        return this;
      }
    });

    c.defineProperty("videoElement", {
      get: function() {
        return this.ele[0].children[0];
      }
    });
  });
});
