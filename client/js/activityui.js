// activityui.js - ActivityComponent

// There are various types of ActivityComponent, each specialized to a different task.
// Regardless of type, each contain a video element, an area for instructions, an input form,
// and a set of function buttons.  They are all here (for now).

define([ "jquery", "services", "videoui" ], function($, Services, VideoComponent) {

  // Service imports.

  var videoService = Services.videoService;
  var apiService = Services.apiService;

  // Component states.

  var STATE_INIT = 0;          // Initial, nothing going on yet.
  var STATE_PLAYBACK = 1;      // Playing the video.
  var STATE_LOADING = 2;       // Waiting for video to load.
  var STATE_LIVE = 3;          // Camera is on but not recording.
  var STATE_RECORDING = 4;     // Camera is on and recording.
  var STATE_SAVING = 5;        // Waiting for info to be saved to back end.

  // Default type-specific component behavior.

  function defaultInstructionsText(self) {
    switch (self.state) {
    case STATE_PLAYBACK:
      return "You may review your recording, save it or discard and re-record it.";
    case STATE_LIVE:
      return "Say cheese! And start recording when you're ready.";
    case STATE_RECORDING:
      return "Recording...";
    case STATE_LOADING:
    case STATE_SAVING:
      return "Please wait...";
    }
    return "";
  }

  var DefaultInner = {
    renderForm: function() {},
    instructionsText: defaultInstructionsText,
    defineSaveButton: function() {}
  }

  // Create Announcement behavior.

  function createAnnouncementRenderForm() {
  }

  function createAnnouncementInstructionText(self) {
    switch (self.state) {
    case STATE_LIVE:
    case STATE_INIT:
      return "Record a video message to send to all Living Connections users.";
    }
    return defaultInstructionsText(self);
  }

  function createAnnouncementDefineSaveButton(callback) {
    callback("Save Announcement",
      function(asset) {
        apiService.postAnnouncement({
          assetId: asset.id,
          startDate: "2016-12-01",
          endDate: "2017-03-01"
        });
      }
    );
  }

  var CreateAnnouncementInner = $.extend({}, DefaultInner, {
    renderForm: createAnnouncementRenderForm,
    instructionsText: createAnnouncementInstructionText,
    defineSaveButton: createAnnouncementDefineSaveButton
  })

  // Update Announcement behavior.

  function updateAnnouncementRenderForm() {
  }

  function updateAnnouncementInstructionText(self) {
    switch (self.state) {
    case STATE_LIVE:
      return "Re-record your video message for all Living Connections users.";
    }
    return defaultInstructionsText(self);
  }

  function updateAnnouncementDefineSaveButton(callback) {
    callback("Update Announcement",
      function(asset) {
        updateService.putAnnouncement({
          assetId: asset.id,
          startDate: "2016-12-01",
          endDate: "2017-03-01"
        });
      }
    );
  }

  var UpdateAnnouncementInner = $.extend({}, DefaultInner, {
    renderForm: createAnnouncementRenderForm,
    instructionsText: createAnnouncementInstructionText,
    defineSaveButton: createAnnouncementDefineSaveButton
  })

  // Video component management.

  function updateVideo(self, src) {
    self.videoComponent.setSource(src);
  }

  function pauseVideo(self) {
    self.videoComponent.getVideoElement().pause();
  }

  // General behaviors.

  function toLiveVideoState(self) {
    updateState(self, STATE_LOADING);
    updateVideo(self, null);
    videoService.open().then(function(stream) {
      updateState(self, STATE_LIVE);
      updateVideo(self, stream);
    });
  }

  function toPlaybackVideoState(self, url) {
    updateState(self, STATE_PLAYBACK);
    updateVideo(self, url);
  }

  function updateInstructions(self) {
    var instructions = self.inner.instructionsText(self);
    self.container.find(".instructions").text(instructions);
  }

  function updateButtons(self) {
    var buttons = self.buttons;
    for (var i = 0; i < buttons.length; ++i) {
      buttons[i].updateVisibility(self);
    }
  }

  function updateState(self, state) {
    if (state != self.state) {
      self.state = state;
      updateInstructions(self);
      updateButtons(self);
    }
  }

  function startRecording(self) {
    videoService.startRecording();
    updateState(self, STATE_RECORDING);
  }

  function stopRecording(self) {
    pauseVideo(self);
    updateState(self, STATE_LOADING);

    videoService.stopRecording(function(blob, url) {
      self.videoBlob = blob;
      videoService.close();
      toPlaybackVideoState(self, url);
    });
  }

  function saveRecording(self, updateModelFunc) {
    pauseVideo(self);
    updateState(self, STATE_SAVING);

    apiService.saveVideo(self.videoBlob)
    .then(function(asset) {
      // TODO: offer follow-up functions
      discardRecording(self);
      return updateModelFunc(asset);
    })
    .catch(function(error) {
      // TODO: error reporting
      alert(error);
      discardRecording(self);
    });
  }

  function discardRecording(self) {
    self.videoBlob = null;
    toLiveVideoState(self);
  }

  // General component construction.

  function innerForType(type) {
    switch (type) {
    case "ann-cre":
      return CreateAnnouncementInner;
    case "ann-upd":
      return UpdateAnnouncementInner;
    }
    return DefaultInner;
  }

  function renderSkeleton(self) {
    self.container
      .hide()
      .addClass("action")
      .append($("<img>")
        .addClass("lilIcon")
        .attr("src", self.options.iconUri))
      .append($("<a>")
        .addClass("exit")
        .text("Exit")
        .attr("href", "#")
        .click(function() { self.closeFunc && self.closeFunc(); }))
      .append($("<div>").addClass("form"))
      .append($("<div>").addClass("instructions"))
      .append(self.videoComponent.container)
      .append($("<div>").addClass("functions"))
  }

  function defineButton(self, label, clickFunc, visibleFunc) {
    var button = $("<div>")
      .addClass("function")
      .text(label)
      .click(function() {
        return clickFunc(self);
      })
      .hide()
      .appendTo(self.container.find(".functions"));
    self.buttons.push({
      updateVisibility: function() {
        button.setVisible(visibleFunc(self));
      }
    })
  }

  function defineButtons(self) {
    defineButton(self, "Start Recording", function() {
      startRecording(self);
    }, function() {
      return self.state == STATE_LIVE;
    }),

    defineButton(self, "Stop Recording", function() {
      stopRecording(self);
    }, function() {
      return self.state == STATE_RECORDING;
    }),

    self.inner.defineSaveButton(function(label, updateModelFunc) {
      defineButton(self, label, function() {
        saveRecording(self, updateModelFunc);
      }, function() {
        return !!self.videoBlob;
      });
    }),

    defineButton(self, "Discard", function() {
      discardRecording(self);
    }, function() {
      return !!self.videoBlob;
    })
  }

  function ActivityComponent(container, options) {
    var self = this;
    var inner = innerForType(options.type);

    self.container = container;
    self.options = options;
    self.inner = inner;
    self.videoComponent = new VideoComponent($("<div>"), {}).setVisible(true);
    self.state = STATE_INIT;
    self.buttons = [];

    renderSkeleton(self);
    inner.renderForm(self);
    defineButtons(self);

    if (options.assetUrl) {
      toPlaybackVideoState(self, options.assetUrl);
    }
    else {
      toLiveVideoState(self);
    }
  }

  ActivityComponent.prototype = {
    setVisible: function(visible) {
      this.container.setVisible(visible);
      return this;
    },
    onActivityClose: function(closeFunc) {
      this.closeFunc = closeFunc;
      return this;
    },
    close: function() {
      videoService.close();
      this.container.hide().empty();
      return this;
    }
  }

  return ActivityComponent;
});
