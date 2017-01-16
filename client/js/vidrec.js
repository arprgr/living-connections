// vidrec.js - VideoRecorder component

define([ "jquery", "services", "ui/index", "slideform" ],
  function($, Services, ui, SlideForm) {

  var Button = ui.Button;
  var Observable = ui.Observable;
  var VideoComponent = ui.Video;

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

  function acceptRecording(self) {
    self.videoComponent.pause();
    var videoBlob = self.videoBlob;
    if (videoBlob) {
      self.state.setValue(STATE_SAVING);
      self.videoBlob = null;
      return apiService.saveVideo(videoBlob)
        .then(function(asset) {
          self.openAsset(asset);
          self.data.asset = asset;
          self.data.assetId = asset.id;
          self.advance();
        })
        .catch(function() {
          toErrorState(self);
        });
    }
    else {
      self.advance();
    }
  }

  return SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      function addButton(label, clickFunc) {
        var button = Button.create(label, clickFunc).setVisible(false);
        button.container.appendTo(self.container.find(".buttons"));
        return button;
      }

      var videoComponent = new VideoComponent($("<div>").addClass("vid"));

      self.container
        .append(videoComponent.container)
        .append($("<div>").addClass("buttons"))

      var startButton = addButton("Start recording", function() {
        startRecording(self);
      });
      var stopButton = addButton("Stop recording", function() {
        stopRecording(self);
      });
      var acceptButton = addButton("Looks good!", function() {
        acceptRecording(self);
      });
      var discardButton = addButton("Discard and re-record", function() {
        self.openCamera();
      });
      var cancelButton = addButton("Cancel", function() {
        self.exit();
      });
      var state = new Observable(STATE_INIT);

      state.addChangeListener(function(value) {
        startButton.visible = value == STATE_LIVE;
        stopButton.visible = value == STATE_RECORDING;
        acceptButton.visible = value == STATE_REVIEW || value == STATE_PLAYBACK;
        discardButton.visible = value == STATE_REVIEW || value == STATE_PLAYBACK;
        cancelButton.visible = value != STATE_RECORDING;
      });

      self.videoComponent = videoComponent;
      self.state = state;
    });

    c.extendPrototype({
      open: function(data) {
        var self = this;
        self.data = data;
        var asset = data.asset;
        return asset ? self.openAsset(asset) : self.openCamera();
      },

      openCamera: function() {
        var self = this;
        self.videoBlob = null;
        self.state.setValue(STATE_LOADING);
        self.videoComponent.clear();
        videoService.open().then(function(stream) {
          showVideo(self, stream, STATE_LIVE);
        });
        return self;
      },

      openAsset: function(asset) {
        var self = this;
        showVideo(self, asset.url, STATE_REVIEW);
        return self;
      },

      close: function() {
        videoService.close();
        return this;
      }
    });
  });
});
