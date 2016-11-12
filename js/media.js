// media.js

define([ "jquery", "error", "lib/webrtc-adapter" ], function($, error) {

  var MEDIA_ERROR_BROWSER_INCAPABLE = error.codes.MEDIA_ERROR_BROWSER_INCAPABLE;

  //
  // Class MediaService
  //
  function MediaService() {
  }

  function init() {
    if (!navigator.mediaDevices) {
      throw new Error(MEDIA_ERROR_BROWSER_INCAPABLE);
    }
  }

  function forEachTrack(self, func) {
    var stream = self.stream;
    if (stream) {
      var tracks = stream.getTracks();
      for (var i = 0; i < tracks.length; ++i) {
        func(tracks[i]);
      }
    }
  }

  function dumpTracks(self) {
    forEachTrack(self, function(track) {
      console.log("Track " + track.id + ": " + track.kind + ", " + track.label);
    });
  }

  function open() {
    var self = this;
    var promise = $.Deferred();
    if (self.stream) {
      promise.resolve(self.stream);
    }
    else {
      navigator.mediaDevices.getUserMedia({   // normalized by webrtc-adapter
        audio: true,
        video: true
      })
      .then(function(stream) {
        self.stream = stream;
        dumpTracks(self);
        promise.resolve(self.stream);
      })
      .catch(function(error) {
        self.error = error;
        promise.fail(error);
      });
    }
  }

  function close() {
    var self = this;
    forEachTrack(self, function(track) {
      track.stop();
    });
    self.stream = null;
  }

  MediaService.prototype = {
    init: init,
    open: open,
    close: close
  }

  //
  // The module.
  //
  return {
    MediaService: MediaService
  }
});
