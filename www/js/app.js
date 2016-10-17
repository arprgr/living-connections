// app.js

define([ "jquery", "utils", "vid", "assertions" ], function($, u, vid) {

  return function() {

    var localVideoController, remoteVideoController;

    var
      openButton = $("<button>")
        .text("Open")
        .click(function() {
          localVideoController.open();
        }),
      closeButton = $("<button>")
        .text("Close")
        .click(function() {
          localVideoController.close();
        }),
      callButton = $("<button>")
        .text("Call")
        .click(function() {
          remoteVideoController.call();
        }),
      hangupButton = $("<button>")
        .text("Hang Up")
        .click(function() {
          remoteVideoController.hangup();
        });

    // jQuery seems unable to manufacture <video> elements apart from letting .html do it.
    $("body")
      .append($("<h1>").text("WebRTC demo"))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
      .append($("<div>")
        .html("<video id='remoteVideo' autoplay></video>"))
      .append($("<div>")
        .append(openButton)
        .append(closeButton)
        .append(callButton)
        .append(hangupButton));

    var localVideo = document.getElementById("localVideo");
    var localVideoController = vid.newLocalVideoController(localVideo);
    var remoteVideo = document.getElementById("remoteVideo");
    var remoteVideoController = vid.newRemoteVideoController(remoteVideo);

    localVideo.addEventListener('loadedmetadata', function() {
      u.trace('Local video videoWidth: ' + this.videoWidth +
        'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    remoteVideo.addEventListener('loadedmetadata', function() {
      u.trace('Remote video videoWidth: ' + this.videoWidth +
        'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    localVideoController.onChangeOpenEnabled(function(enabled) {
      openButton.attr("disabled", !enabled);
    });
    localVideoController.onChangeStream(function(stream) {
      remoteVideoController.setSourceStream(stream);
      localVideo.srcObject = stream;
      closeButton.attr("disabled", !stream);
    });
    remoteVideoController.onChangeCallEnabled(function(enabled) {
      callButton.attr("disabled", !enabled);
    });
    remoteVideoController.onChangeHangupEnabled(function(enabled) {
      hangupButton.attr("disabled", !enabled);
    });
  }
});
