// vid.js - VideoService

define([ "jquery", "lib/webrtc-adapter", "lib/RecordRTC" ], function($, webrtc, RecordRTC) {

  function hasMediaDevices() {
    return !!navigator.mediaDevices;
  }

  function hasMediaRecorder() {
    return typeof MediaRecorder == "function";
  }

  function chooseMimeType(self) {
    var mimePriorityList = self.mimePriorityList;
    for (var i = 0; i < mimePriorityList.length; ++i) {
      var mimeType = mimePriorityList[i];
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
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

    var chunks = [];

    var mediaRecorder = new MediaRecorder(self.stream, {
      mimeType: self.mimeType
    });

    mediaRecorder.ondataavailable = function(event) {
      if (chunks.length == self.bufferLimit) {
        stopRecording(self);
      }
      else {
        chunks.push(event.data);
      }
    }

    mediaRecorder.start(self.timeChunk);

    self.recording = true;
    self.chunks = chunks;
    self.mediaRecorder = mediaRecorder;
  }

  function stopRecording(self) {
    var mediaRecorder = self.mediaRecorder;
    if (mediaRecorder && mediaRecorder.state == "recording") {
      mediaRecorder.ondataavailable = null;
      mediaRecorder.stop();
      self.mediaRecorder = null;
      self.recording = false;
    }
  }

  function captureVideoBlob(self) {
    return window.URL.createObjectURL(new Blob(self.chunks, { type: self.mimeType }));
  }

  function VideoService(options) {
    var self = this;
    $.extend(self, options);
    self.mimeType = hasMediaRecorder() && chooseMimeType(self);
  }

  VideoService.prototype = {
    isCapable: function() {
      return hasMediaDevices() && hasMediaRecorder() && !!this.mimeType;
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
    stopRecording: function() {
      return stopRecording(this);
    },
    captureVideoBlob: function() {
      return captureVideoBlob(this);
    }
  }

  return VideoService;
});
