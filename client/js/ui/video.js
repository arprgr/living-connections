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
        video.paused ? video.play() : video.pause();
      }

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

      function showPlaying() {
        self.playOverlay.visible = false;
      }

      function showPaused() {
        self.playOverlay.visible = true;
      }

      function showProgress() {
        var video = self.videoElement;
        var currentTime = video.currentTime || 0;
        var duration = video.duration || 5;
        var percentage = Math.floor((100 / duration) * currentTime);
        self.progressBar.ele.val(percentage);
        self.restartButton.enabled = currentTime > 0;
      }

      function restart() {
        self.videoElement.currentTime = 0;
        self.playOverlay.visible = true;
        showProgress();
      }

      self.playOverlay = new Component("<div class='overlay'>").addPlugin({
        onClick: playOrPause
      });
      self.restartButton = new Button("<button>", { cssClass: "restart" }).addPlugin({
        onClick: restart
      });
      self.progressBar = new Component("<progress min='0' max='100' value='0'>");
      self.fullScreenButton = new Button("<button>", { cssClass: "fullScreen" }).addPlugin({
        onClick: fullScreen
      });

      // jQuery is unable to handle creation of video elements.
      self.ele.html("<video></video>");
      var video = self.videoElement;
      video.addEventListener("click", playOrPause);
      video.addEventListener("playing", showPlaying);
      video.addEventListener("pause", showPaused);
      video.addEventListener("ended", restart);
      video.addEventListener("timeupdate", showProgress);

      self.controls = new Component("<div class='controls'>");
      self.controls.ele
        .append(self.restartButton.ele)
        .append(self.progressBar.ele)
        .append(self.fullScreenButton.ele)
    }

    // The outer element is usually a div.  The div contains two elements: the video and a container
    // for controls.
    c.defineInitializer(function() {
      var self = this;
      initControls(self);
      self.ele
        .append(self.playOverlay.ele)
        .append(self.controls.ele);
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
        theVideo.onerror = function(err) {
          promise.reject(err);
        }

        var srcIsUrl = typeof src == "string";
        theVideo.src = srcIsUrl ? src : "";
        theVideo.srcObject = srcIsUrl ? null : src;
        theVideo.autoplay = options.autoplay || (!!src && !srcIsUrl);
        theVideo.muted = !srcIsUrl;
        self.controls.visible = srcIsUrl;
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
