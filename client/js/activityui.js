// activityui.js - ActivityComponent

define([ "jquery", "services", "videoui" ], function($, Services, VideoComponent) {

  var videoService = Services.videoService;
  var videoStoreService = Services.videoStoreService;

  var STATE_INIT = 0;
  var STATE_PLAYBACK = 1;
  var STATE_WAITING_FOR_STREAM = 2;
  var STATE_LIVE = 3;
  var STATE_RECORDING = 4;
  var STATE_LOADING = 5;
  var STATE_SAVING = 6;

  var DEFAULT_FORM_DATA = {
    renderAdditionalElements: function() {},
    instructionsLoadless: "Record a video.",
    instructionsLoaded: "Send or discard your video.",
    saveFunction: function(resolve, reject) {
      resolve();
    }
  }

  var FORM_DATA_BY_TYPE = {
    "ann-cre": {
      instructionsLoadless: "Record a video message to send to all Living Connections users.",
      instructionsLoaded: "Click save to send, or discard to try again.",
    },
    "inv-cre": {
      renderAdditionalElements: function(div) {
        div.append($("<div>")
          .append($("<span>").text("Invite who: "))
          .append($("<input>").attr("type", "text")));
      },
      instructionsLoadless: "Record a video to send with your invitation."
    },
    "pro-cre": {
      instructionsLoadless: "Introduce yourself to your connections!"
    }
  }

  function formDataFor(actionItem) {
    return $.extend({}, DEFAULT_FORM_DATA, FORM_DATA_BY_TYPE[actionItem.type]);
  }

  function functionButton(label, clickFunc) {
    return $("<div>")
      .addClass("function")
      .text(label)
      .click(clickFunc)
      .hide();
  }

  function ActivityComponent(container, options) {
    var self = this;
    self.container = container;
    self.additionalElements = $("<div>");
    self.videoComponent = new VideoComponent($("<div>"), {}).setVisible(true);
    self.state = STATE_INIT;

    container
      .hide()
      .addClass("action")
      .append($("<img>")
        .addClass("lilIcon"))
      .append($("<a>")
        .addClass("exit")
        .text("Exit")
        .attr("href", "#")
        .click(function() { self.closeFunc && self.closeFunc(); }))
      .append(self.additionalElements)
      .append(self.instructionsElement = $("<div>")
        .addClass("instructions"))
      .append(self.videoComponent.container)
      .append($("<div>")
        .addClass("functions")
        .append(self.startRecordingButton = functionButton("Start Recording", function() {
          startRecording(self);
        }))
        .append(self.stopRecordingButton = functionButton("Stop Recording", function() {
          stopRecording(self);
        }))
        .append(self.saveRecordingButton = functionButton("Save", function() {
          saveRecording(self);
        }))
        .append(self.discardRecordingButton = functionButton("Discard", function() {
          discardRecording(self);
        }))
      );
  }

  function updateVideo(self, src) {
    self.videoComponent.setSource(src);
  }

  function pauseVideo(self) {
    self.videoComponent.getVideoElement().pause();
  }

  function toLiveVideoState(self) {
    updateState(self, STATE_WAITING_FOR_STREAM);
    updateVideo(self, null);
    videoService.open().then(function(stream) {
      updateState(self, STATE_LIVE);
      updateVideo(self, stream);
    });
  }

  function updateFormElements(self) {
    if (self.actionItem) {
      formDataFor(self.actionItem).renderAdditionalElements(self.additionalElements);
      self.container.find(".lilIcon").attr("src", self.actionItem.iconUri);
    }
    else {
      self.additionalElements.empty();
    }
  }

  function updateInstructions(self) {
    var instructions = "";
    if (self.actionItem) {
      var formData = formDataFor(self.actionItem);
      var loaded = !!self.videoBlob;
      instructions = loaded ? formData.instructionsLoaded : formData.instructionsLoadless;
    }
    self.instructionsElement.text(instructions);
  }

  function updateButtons(self) {
    var state = self.state;
    var videoBlob = self.videoBlob;
    self.startRecordingButton.setVisible(state == STATE_LIVE);
    self.stopRecordingButton.setVisible(state == STATE_RECORDING);
    self.saveRecordingButton.setVisible(!!videoBlob);
    self.discardRecordingButton.setVisible(!!videoBlob);
  }

  function updateState(self, state) {
    if (state != self.state) {
      self.state = state;
      updateInstructions(self);
      updateButtons(self);
    }
    return self;
  }

  function setActionItem(self, actionItem) {
    if (actionItem !== self.actionItem) {
      self.actionItem = actionItem;
      updateFormElements(self);
      self.videoBlob = null;
      if (actionItem) {
        if (actionItem.videoUrl) {
          updateState(self, STATE_PLAYBACK);
          updateVideo(self, actionItem.videoUrl);
        }
        else {
          toLiveVideoState(self);
        }
      }
      else {
        updateState(self, STATE_INIT);
        updateVideo(self, null);
      }
    }
    return self;
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
      updateVideo(self, url);
      updateState(self, STATE_PLAYBACK);
    });
  }

  function saveRecording(self) {
    pauseVideo(self);
    updateState(self, STATE_SAVING);

    videoStoreService.saveVideo(self.videoBlob)
    .then(function() {
      // TODO: offer follow-up functions
      discardRecording(self);
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

  ActivityComponent.prototype = {
    setVisible: function(visible) {
      this.container.setVisible(visible);
      return this;
    },
    onActivityClose: function(func) {
      var self = this;
      self.closeFunc = func;
      return self;
    },
    setActionItem: function(actionItem) {
      return setActionItem(this, actionItem);
    }
  }

  return ActivityComponent;
});
