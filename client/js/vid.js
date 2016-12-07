// vid.js

define([ "jquery", "lib/webrtc-adapter" ], function($) {

  //
  // Function IsCapable
  //
  function IsCapable() {
    return !!navigator.mediaDevices;
  }

  //
  // Class LocalVideoController
  //

  function forEachTrack(stream, func) {
    if (stream) {
      var tracks = stream.getTracks();
      for (var i = 0; i < tracks.length; ++i) {
        func(tracks[i]);
      }
    }
  }

  function dumpTracks(stream) {
    forEachTrack(stream, function(track) {
      console.log("Track " + track.id + ": " + track.kind + ", " + track.label);
    });
  }

  function open() {
    var self = this;
    var deferred = $.Deferred();
    if (self.stream) {
      deferred.resolve(self.stream);
    }
    else if (!IsCapable()) {
      defered.reject("browser not video-capable");
    }
    else {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      })
      .then(function(stream) {
        self.stream = stream;
        dumpTracks(stream);
        deferred.resolve(stream);
      })
      .catch(function(error) {
        self.openError = error;
        deferred.reject(error);
      });
    }
    return deferred;
  }

  function close() {
    var self = this;
    forEachTrack(self.stream, function(track) {
      track.stop();
    });
    self.stream = null;
  }

  function isOpen() {
    return !!this.stream;
  }

  function LocalVideoController() {
  }

  LocalVideoController.prototype = {
    open: open,
    close: close,
    isOpen: isOpen
  }

  LocalVideoController.IsCapable = IsCapable;

  return LocalVideoController;
});
