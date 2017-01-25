// vidrec.js - VideoRecorder component

define([ "jquery", "services", "ui/index", "editor" ], function($, Services, ui, Editor) {

  var videoService = Services.videoService;

  // Component states.

  var STATE_INIT = 0;          // Initial, nothing going on yet.
  var STATE_LIVE = 1;          // Camera is on but not recording.  There is no saved video.
  var STATE_RECORDING = 2;     // Camera is on and recording.
  var STATE_PLAYBACK = 3;      // Playing the video just recorded.
  var STATE_SAVING = 4;        // Waiting for info to be saved to back end.
  var STATE_LOADING = 5;       // Waiting for a video to load.
  var STATE_REVIEW = 6;        // Playing a previously recorded video.
  var STATE_ERROR = 8;         // Something went wrong.

  return Editor.Cell.defineClass(function(c) {

    c.defineDefaultOptions({
      prompt: "Record a videogram",
      summary: "Your videogram",
      outputProperties: [ "asset" ]
    });

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
        return Services.apiService.saveVideo(videoBlob)
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

    c.defineInitializer(function() {
      var self = this;

      function addButton(label, clickFunc) {
        var button = ui.Button.create(label, clickFunc).setVisible(false);
        button.container.appendTo(self.container.find(".buttons"));
        return button;
      }

      var videoComponent = new ui.Video($("<div>").addClass("vid"));

      self.form.container
        .append(videoComponent.container)
        .append($("<div>").addClass("buttons"));
      self.summary.container
        .append($("<div>").addClass("thumb").append($("<img>")));

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
      var state = new ui.Observable(STATE_INIT);

      state.addChangeListener(function(value) {
        startButton.visible = value == STATE_LIVE;
        stopButton.visible = value == STATE_RECORDING;
        acceptButton.visible = value == STATE_REVIEW || value == STATE_PLAYBACK;
        discardButton.visible = value == STATE_REVIEW || value == STATE_PLAYBACK;
      });

      self.videoComponent = videoComponent;
      self.state = state;
    });

    function webmToJpg(url) {
      return url
        .replace(/webm$/, "jpg")
        .replace(/v[0-9]+/, "w_400,h_400,c_crop,g_face,r_40/w_80");
    }

    c.extendPrototype({

      openForm: function() {
        var self = this;
        var asset = self.data.asset;
        asset ? self.openAsset(asset) : self.openCamera();
      },

      openSummary: function() {
        var self = this;
        var asset = self.data.asset;
        self.container.find(".thumb img").attr("src", asset && webmToJpg(asset.url));
        return self;
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
        showVideo(this, asset.url, STATE_REVIEW);
        return this;
      },

      close: function() {
        videoService.close();
        return this;
      },

      summarize: function() {
        var self = this;
        return self.isLacking ? self.options.prompt : self.options.summary;
      }
    });
  });
});
