// vidrec.js - VideoRecorder component

define([ "jquery", "component", "services", "obs", "videoui", "button", "slideform" ],
  function($, Component, Services, Observable, VideoComponent, Button, SlideForm) {

  // Service imports.

  var videoService = Services.videoService;
  var apiService = Services.apiService;

  // Component states.

  var STATE_INIT = 0;          // Initial, nothing going on yet.
  var STATE_LIVE = 1;          // Camera is on but not recording.  There is no saved video.
  var STATE_RECORDING = 2;     // Camera is on and recording.
  var STATE_PLAYBACK = 3;      // Playing the video just recorded.
  var STATE_SAVING = 4;        // Waiting for info to be saved to back end.
  var STATE_LOADING = 5;       // Waiting for a video to load.
  var STATE_REVIEW = 6;        // Playing a previously recorded video.
  var STATE_ERROR = 8;         // Something went wrong.

  function standardButton(label, clickFunc) {
    return new Button($("<button>").addClass("standard"))
      .setVisible(false)
      .setLabel(label)
      .onClick(clickFunc)
  }

  function toErrorState(self) {
    self.videoBlob = null;
    self.videoComponent.clear();
    self.state.setValue(STATE_ERROR);
  }

  function showVideo(self, src, nextState) {
    self.state.setValue(STATE_LOADING);
    self.videoComponent.load(src)
    .then(function() {
      self.state.setValue(nextState);
    })
    .catch(function() {
      toErrorState(self);
    });
  }

  function startRecording(self) {
    videoService.startRecording();
    self.state.setValue(STATE_RECORDING);
    return self;
  }

  function stopRecording(self) {
    self.videoComponent.pause();
    self.state.setValue(STATE_LOADING);
    videoService.stopRecording(function(blob, url) {
      self.videoBlob = blob;
      videoService.close();
      showVideo(self, url, STATE_PLAYBACK);
    });
    return self;
  }

  function doSave(self) {
    self.videoComponent.pause();
    self.state.setValue(STATE_SAVING);
    var videoBlob = self.videoBlob;
    self.videoBlob = null;
    return apiService.saveVideo(videoBlob)
      .then(function(asset) {
        self.openAsset(asset);
        if (self.context) {
          self.context.data.asset = asset;
          self.context.data.assetId = asset.id;
          self.context.advance();
        }
      })
      .catch(function() {
        toErrorState(self);
      });
  }

  return Component.defineClass(SlideForm.Form, function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoComponent = new VideoComponent($("<div>").addClass("vid"));
      var startButton = standardButton("Start recording", function() {
        startRecording(self);
      });
      var stopButton = standardButton("Stop recording", function() {
        stopRecording(self);
      });
      var acceptButton = standardButton("Looks good!", function() {
        doSave(self);
      });
      var discardButton = standardButton("Discard and re-record", function() {
        self.openCamera();
      });
      var cancelButton = standardButton("Cancel", function() {
        self.cancel();
      });
      var state = new Observable(STATE_INIT);

      state.addChangeListener(function(value) {
        startButton.visible = value == STATE_LIVE;
        stopButton.visible = value == STATE_RECORDING;
        acceptButton.visible = !!self.videoBlob;
        discardButton.visible = !!self.videoBlob;
        cancelButton.visible = value != STATE_RECORDING;
      });

      self.container
        .append(videoComponent.container)
        .append($("<div>")
          .addClass("buttons")
          .append(startButton.container)
          .append(stopButton.container)
          .append(acceptButton.container)
          .append(discardButton.container)
          .append(cancelButton.container)
        );

      self.videoComponent = videoComponent;
      self.state = state;
    });

    c.defineFunction("open", function() {
      var self = this;
      if (self.context && self.context.data.asset) {
        self.openAsset(self.context.data.asset);
      }
      else {
        self.openCamera();
      }
    });

    c.defineFunction("openCamera", function() {
      var self = this;
      self.videoBlob = null;
      self.state.setValue(STATE_LOADING);
      self.videoComponent.clear();
      videoService.open().then(function(stream) {
        showVideo(self, stream, STATE_LIVE);
      });
    });

    c.defineFunction("openAsset", function(asset) {
      var self = this;
      showVideo(self, asset.url, STATE_REVIEW);
      return self;
    });

    c.defineFunction("close", function() {
      videoService.close();
      return this;
    });
  });
});
