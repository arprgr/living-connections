// activityui.js - ActivityComponent

// There are various types of ActivityComponent, each specialized to a different task.
// Regardless of type, each contain a video element, an area for instructions, an input form,
// and a set of function buttons.  They are all here (for now).

define([ "jquery", "services", "videoui" ], function($, Services, VideoComponent) {

  // Service imports.

  var videoService = Services.videoService;
  var apiService = Services.apiService;

  var SAVE_METHODS = {
    "ann": {
      "cre": apiService.postAnnouncement.bind(apiService),
      "upd": apiService.updateAnnouncement.bind(apiService)
    },
    "gre": {
      //"cre": apiService.postMessage.bind(apiService),
      //"upd": apiService.updateMessage.bind(apiService)
    },
    "inv": {
      //"cre": apiService.postInvite.bind(apiService),
      //"upd": apiService.updateInvite.bind(apiService)
    },
    "pro": {
      "cre": apiService.updateUser.bind(apiService),
      "upd": apiService.updateUser.bind(apiService)
    }
  }

  // Component states.

  var STATE_INIT = 0;          // Initial, nothing going on yet.
  var STATE_LIVE = 1;          // Camera is on but not recording.  There is no saved video.
  var STATE_RECORDING = 2;     // Camera is on and recording.
  var STATE_PLAYBACK = 3;      // Playing the video just recorded.
  var STATE_SAVING = 4;        // Waiting for info to be saved to back end.
  var STATE_LOADING = 5;       // Waiting for a video to load.
  var STATE_VIEW = 6;          // Playing a previously recorded video - unchangeable.
  var STATE_REVIEW = 7;        // Playing a previously recorded video - changeable.
  var STATE_ERROR = 78         // Something went wrong.

  // Video component management.

  function updateVideo(self, src) {
    return self.videoComponent.setSource(src);
  }

  function pauseVideo(self) {
    self.videoComponent.getVideoElement().pause();
  }

  // Component state management.

  // Instructions depend on state.
  function instructionsText(self) {
    switch (self.state) {
    case STATE_LIVE:
      return "Say cheese! And start recording when you're ready.";
    case STATE_RECORDING:
      return "Recording...";
    case STATE_PLAYBACK:
      return "Review your recording, save it or discard and re-record it.";
    case STATE_SAVING:
      return "Saving, please wait...";
    case STATE_LOADING:
      return "Loading, please wait...";
    case STATE_ERROR:
      return "Uh oh, we're stuck.  Try reloading the page.";
    }
    return "";
  }

  // Label for save button depends on state.
  function saveButtonLabel(self) {
    var verb = "Send";
    var what;
    switch (self.what) {
    case "ann":
      what = "Announcement";
      break;
    case "pro":
      verb = "Save";
      what = "Profile";
      break;
    case "gre":
      what = "Greeting";
      break;
    case "inv":
      what = "Invitation";
      break;
    case "rem":
      verb = "Save";
      what = "Reminder";
    }
    if (self.action == "upd") {
      verb = "Update";
    }
    return verb + " " + what;
  }

  function updateInstructions(self) {
    self.container.find(".instructions").text(instructionsText(self));
  }

  function updateButtons(self) {
    var buttons = self.buttons;
    for (var i = 0; i < buttons.length; ++i) {
      buttons[i].update();
    }
  }

  function updateState(self, state) {
    if (state != self.state) {
      self.state = state;
      updateInstructions(self);
      updateButtons(self);
    }
  }

  function toErrorState(self, error) {
    // console.log(error);
    self.videoBlob = null;
    updateVideo(self, null);
    updateState(self, STATE_ERROR);
  }

  function isLive(self) {
    return self.state == STATE_LIVE;
  }

  function isReview(self) {
    return self.state == STATE_REVIEW;
  }

  function isRecording(self) {
    return self.state == STATE_RECORDING;
  }

  function isGravid(self) {
    return !!self.videoBlob;
  }

  function hasSender(self) {
    return !!self.who && self.state == STATE_VIEW;
  }

  // Actions.

  function openCamera(self) {
    updateState(self, STATE_LOADING);
    updateVideo(self, null);
    videoService.open()
    .then(function(stream) {
      return updateVideo(self, stream);
    })
    .then(function() {
      updateState(self, STATE_LIVE);
    })
    .catch(function() {
      updateState(self, STATE_ERROR);
    });
  }

  function showVideo(self, url) {
    updateState(self, STATE_LOADING);
    updateVideo(self, url)
    .then(function() {
      updateState(self, firstState(self));
    })
    .catch(function(error) {
      toErrorState(self, error);
    });
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
      updateState(self, STATE_PLAYBACK);
      updateVideo(self, url);
    });
  }

  function saveRecording(self) {
    pauseVideo(self);
    updateState(self, STATE_SAVING);
    apiService.saveVideo(self.videoBlob)
    .then(function(asset) {
      self.videoBlob = null;
      self.form.assetId = asset.id;
      return SAVE_METHODS[self.what][self.action](self.form);
    })
    .catch(function(error) {
      toErrorState(self, error);
    });
  }

  function discardRecording(self) {
    self.videoBlob = null;
    openCamera(self);
  }

  function reply(self) {
  }

  function seeSenderProfile(self) {
  }

  // View construction.

  function renderSkeleton(self, options) {
    self.container
      .hide()
      .addClass("action")
      .append($("<img>")
        .addClass("lilIcon")
        .attr("src", options.iconUri))
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

    function updateButton() {
      button.text(typeof label == "function" ? label(self) : label);
      button.setVisible(visibleFunc(self));
    }

    var button = $("<div>")
      .addClass("function")
      .click(function() {
        clickFunc(self);
      })
      .hide()
      .appendTo(self.container.find(".functions"));

    updateButton();

    self.buttons.push({
      update: updateButton
    });
  }

  function defineButtons(self) {
    defineButton(self, "Re-record", discardRecording, isReview);
    defineButton(self, "Start Recording", startRecording, isLive);
    defineButton(self, "Stop Recording", stopRecording, isRecording);
    defineButton(self, saveButtonLabel, saveRecording, isGravid);
    defineButton(self, "Discard", discardRecording, isGravid);
    defineButton(self, "Reply to " + self.who, reply, hasSender);
    defineButton(self, "See " + self.who + "'s Profile", seeSenderProfile, hasSender);
  }

  function ActivityComponent(container, options) {
    var self = this;
    self.container = container;
    self.videoComponent = new VideoComponent($("<div>"), {}).setVisible(true);
    self.state = STATE_INIT;
    self.buttons = [];
    var parts = options.type.split("-");
    self.what = parts[0];
    self.action = parts[1];
    self.who = options.sender && options.sender.name;
    self.form = {
      startDate: "2017-01-01",
      endDate: "2017-03-01"
    };

    renderSkeleton(self, options);
    //renderForm(self);
    defineButtons(self);

    if (options.assetUrl) {
      showVideo(self, options.assetUrl);
    }
    else {
      openCamera(self);
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
