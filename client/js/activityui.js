// activityui.js

define([ "jquery", "services" ], function($, Services) {

  var sessionManager = Services.sessionManager;
  var videoService = Services.videoService;
  var videoStoreService = Services.videoStoreService;

  function selectContainer() {
    return $("#app .activity");
  }

  var DEFAULT_FORM_DATA = {
    renderAdditionalElements: function() {},
    instructionsLoadless: "Record a video.",
    instructionsLoaded: "Send or discard your video.",
    saveButtonLabel: "Send",
    saveFunction: function(resolve, reject) {
      resolve();
    }
  }

  var FORM_DATA_BY_TYPE = {
    "inv-cre": {
      renderAdditionalElements: function(div) {
        div.append($("<div>")
          .append($("<span>").text("Invite who: "))
          .append($("<input>").attr("type", "text")));
      },
      instructionsLoadless: "Record a video to send with your invitation."
    },
    "pro-cre": {
      saveButtonLabel: "Save",
      instructionsLoadless: "Introduce yourself to your connections!"
    }
  }

  function formDataFor(actionItem) {
    return $.extend({}, DEFAULT_FORM_DATA, FORM_DATA_BY_TYPE[actionItem.type]);
  }

  function videoFromCamera() {
    var theVideo = document.getElementById("theVideo");
    theVideo.src = "";
    theVideo.controls = false;
    videoService.open().then(function(stream) {
      theVideo.srcObject = stream;
    });
  }

  function videoFromUrl(url) {
    var theVideo = document.getElementById("theVideo");
    theVideo.srcObject = null;
    theVideo.src = url;
    theVideo.controls = true;
  }

  function functionButton(label, clickFunc) {
    return $("<div>")
      .addClass("function")
      .text(label)
      .click(clickFunc)
      .hide();
  }

  function startRecording(self) {
    videoService.startRecording();
    toNextState(self);
  }

  function stopRecording(self) {
    var stopped;
    videoService.stopRecording(function(blob, url) {
      stopped = true;
      self.videoBlob = blob;
      self.videoUrl = url;
      toNextState(self);
    });
    if (!stopped) {
      toNextState(self);
    }
  }

  function discardRecording(self) {
    self.videoUrl = null;
    self.videoBlob = null;
    toNextState(self);
  }

  function saveRecording(self) {
    self.saving = true;
    toNextState(self);

    videoStoreService.saveVideo(self.videoBlob)
    .then(function() {
      self.saving = false;
      discardRecording(self);
    })
    .catch(function(error) {
      // TODO: error reporting
      alert(error);
      self.saving = false;
      toNextState(self);
    });
  }

  function render(self) {
    var actionDiv = $("<div>").addClass("action");

    actionDiv
      .append($("<img>")
        .addClass("lilIcon")
        .attr("src", self.openActionItem.iconUri))
      .append($("<a>")
        .addClass("exit")
        .text("Exit")
        .attr("href", "#")
        .click(function() { self.closeFunc && self.closeFunc(); }))

    self.formData.renderAdditionalElements(actionDiv);

    actionDiv
      .append(self.instructionsElement = $("<div>")
        .addClass("instructions"))
      .append($("<div>")
        .addClass("vid")
        .html("<video id='theVideo'></video>"))
      .append($("<div>")
        .addClass("functions")
        .append(self.startRecordingButton = functionButton("Start Recording", function() {
          startRecording(self);
        }))
        .append(self.stopRecordingButton = functionButton("Stop Recording", function() {
          stopRecording(self);
        }))
        .append(self.saveRecordingButton = functionButton(self.formData.saveButtonLabel, function() {
          saveRecording(self);
        }))
        .append(self.discardRecordingButton = functionButton("Discard", function() {
          discardRecording(self);
        }))
      );

    selectContainer().empty().append(actionDiv);
  }

  function toNextState(self) {
    if (self.videoUrl != null) {
      self.instructionsElement.text(self.formData.instructionsLoaded);
      videoFromUrl(self.videoUrl);
    }
    else {
      self.instructionsElement.text(self.formData.instructionsLoadless);
      videoFromCamera();
    }

    self.startRecordingButton.setVisible(!self.videoBlob && !videoService.recording);
    self.stopRecordingButton.setVisible(videoService.recording);
    self.saveRecordingButton.setVisible(!!self.videoBlob);
    self.discardRecordingButton.setVisible(!!self.videoBlob);
  }

  function activate(self) {
    render(self);
    if (self.openActionItem.videoUrl) {
      self.videoUrl = self.openActionItem.videoUrl;
      toNextState(self);
    }
    else {
      videoService.open().then(function(stream) {
        toNextState(self);
      });
    }
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    // TODO: display unresponsive state.
  }

  function handleSessionManagerActionChange() {
    var self = this;
    // TODO: show urgent items.
  }

  function open(self, actionItem) {
    self.openActionItem = actionItem;
    self.formData = formDataFor(actionItem);
    activate(self);
    return self;
  }

  function close(self) {
    self.openActionItem = null;
    videoService.close();
    selectContainer().empty();
    return self;
  }

  function Controller() {
    var self = this;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
  }

  Controller.prototype = {
    setVisible: function(visible) {
      selectContainer().setVisible(visible);
    },
    onActivityClose: function(func) {
      var self = this;
      self.closeFunc = func;
      return self;
    },
    open: function(actionItem) {
      return open(this, actionItem);
    },
    close: function() {
      return close(this);
    }
  }

  return Controller;
});
