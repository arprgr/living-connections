// activityui.js

define([ "jquery", "services" ], function($, Services) {

  var sessionManager = Services.sessionManager;
  var videoService = Services.videoService;

  function selectContainer() {
    return $("#app .activity");
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

  function updateFunctionButtons(self) {
    self.startRecordingButton.setVisible(!self.videoUrl && !videoService.recording);
    self.stopRecordingButton.setVisible(videoService.recording);
    self.saveRecordingButton.setVisible(!!self.videoUrl && !videoService.recording);
    self.discardRecordingButton.setVisible(!!self.videoUrl && !videoService.recording);
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
    updateFunctionButtons(self);
  }

  function stopRecording(self) {
    videoService.stopRecording();
    var url = videoService.captureVideoBlob();
    self.videoUrl = url;
    videoFromUrl(url);
    updateFunctionButtons(self);
  }

  function saveRecording(self) {
    updateFunctionButtons(self);
  }

  function discardRecording(self) {
    self.videoUrl = null;
    videoFromCamera();
    updateFunctionButtons(self);
  }

  function render(self) {
    selectContainer()
      .empty()
      .append($("<div>")
        .addClass("action")
        .append($("<img>")
          .addClass("lilIcon")
          .attr("src", self.openActionItem.iconUri))
        .append($("<a>")
          .addClass("exit")
          .text("Exit")
          .attr("href", "#")
          .click(function() { self.closeFunc && self.closeFunc(); }))
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
          .append(self.saveRecordingButton = functionButton("Save", function() {
            saveRecording(self);
          }))
          .append(self.discardRecordingButton = functionButton("Discard", function() {
            discardRecording(self);
          }))
        )
      );
  }

  function activate(self) {
    render(self);
    videoFromCamera();
    updateFunctionButtons(self);
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
