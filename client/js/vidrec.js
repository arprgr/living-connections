// vidrec.js - VideoRecorder component

define([ "jquery", "component", "services", "obs", "videoui", "button" ],
  function($, Component, Services, Observable, VideoComponent, Button) {

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
    self.asset.setValue(null);
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
    apiService.saveVideo(self.videoBlob)
      .then(function(asset) {
        self.openAsset(asset);
      })
      .catch(function() {
        toErrorState(self);
      });
    self.videoBlob = null;
  }

  return Component.defineClass(function(c) {

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
      var state = new Observable(STATE_INIT);

      state.addChangeListener(function(value) {
        startButton.visible = value == STATE_LIVE;
        stopButton.visible = value == STATE_RECORDING;
        acceptButton.visible = !!self.videoBlob;
        discardButton.visible = !!self.videoBlob;
      });

      self.container
        .append(videoComponent.container)
        .append($("<div>")
          .addClass("buttons")
          .append(startButton.container)
          .append(stopButton.container)
          .append(acceptButton.container)
          .append(discardButton.container)
        );

      self.videoComponent = videoComponent;
      self.state = state;
      self.asset = new Observable();
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
      self.asset.setValue(asset);
      showVideo(self, asset.url, STATE_REVIEW);
      return self;
    });

    c.defineFunction("close", function() {
      var self = this;
      videoService.close();
      self.container.hide().empty();
      return self;
    });
  });
});
