// activityui.js

define([ "jquery", "services" ], function($, Services) {

  var sessionManager = Services.sessionManager;
  var videoService = Services.videoService;

  function selectContainer() {
    return $("#app .activity");
  }

  function provisionVideo(self) {
    var theVideo = document.getElementById("theVideo");

    theVideo.addEventListener("loadedmetadata", function() {
      //var ratio = this.videoWidth / this.videoHeight;
    });

    videoService.open().then(function(stream) {
      theVideo.srcObject = stream;
    });
  }

  function updateFunctionButtons(self) {
    var startRecordingButton = self.startRecordingButton;
    var stopRecordingButton = self.stopRecordingButton;
    var saveRecordingButton = self.saveRecordingButton;
    startRecordingButton.setVisible(!videoService.recording);
    stopRecordingButton.setVisible(videoService.recording);
    saveRecordingButton.setVisible(!!self.videoUrl && !videoService.recording);
    startRecordingButton.text(self.videoUrl ? "Re-record" : "Start Recording");
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
    $("#theVideo").replaceWith($("<video id='theVideo' controls>").attr("src", url));
    self.videoUrl = url;
    updateFunctionButtons(self);
  }

  function saveRecording(self) {
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
          .html("<video id='theVideo' autoplay></video>"))
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
        )
      );
  }

  function activate(self) {
    render(self);
    provisionVideo(self);
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
