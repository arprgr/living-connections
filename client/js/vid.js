// vid.js - VideoService

define([ "jquery", "lib/webrtc-adapter", "lib/RecordRTC" ], function($, webrtc, RecordRTC) {

  function hasMediaDevices() {
    return !!navigator.mediaDevices;
  }

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

  function open(self) {
    var deferred = $.Deferred();
    if (self.stream) {
      deferred.resolve(self.stream);
    }
    else if (!self.isCapable()) {
      deferred.reject("browser not video-capable");
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

  function close(self) {
    forEachTrack(self.stream, function(track) {
      track.stop();
    });
    self.stream = null;
  }

  function startRecording(self) {

    var recordRTC = RecordRTC(self.stream, {
      type: "video"
    });

    recordRTC.startRecording(self.timeChunk);
    self.recordRTC = recordRTC;
    self.recording = true;
  }

  function stopRecording(self, callback) {
    var recordRTC = self.recordRTC;
    if (recordRTC) {
      recordRTC.stopRecording(function() {
        close(self);
        recordRTC.getDataURL(function(url) {
          callback(recordRTC.blob, url);
        });
      });
    }
    else {
      callback(null);
    }
    self.recording = false;
    self.recordRTC = null;
  }

  function VideoService(options) {
    var self = this;
    $.extend(self, options);
  }

  VideoService.prototype = {
    isCapable: function() {
      return hasMediaDevices();
    },
    open: function() {
      return open(this);
    },
    close: function() {
      close(this);
    },
    isOpen: function() {
      return !!this.stream;
    },
    startRecording: function() {
      return startRecording(this);
    },
    stopRecording: function(callback) {
      return stopRecording(this, callback);
    }
  }

  return VideoService;
});
