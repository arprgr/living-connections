// app.js

define([ "jquery", "utils", "vid", "assertions" ], function($, u, vid) {

  return function() {

    var localVideoController, remoteVideoController;

    var
      startButton = $("<button>")
        .text("Start")
        .click(function() {
          localVideoController.start();
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
        .append(startButton)
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

    localVideoController.onChangeLocalStream(function(localStream) {
      startButton.attr("disabled", !!localStream);
      remoteVideoController.setSourceStream(localStream);
    });
    remoteVideoController.onChangeCallEnabled(function(enabled) {
      callButton.attr("disabled", !enabled);
    });
    remoteVideoController.onChangeHangupEnabled(function(enabled) {
      hangupButton.attr("disabled", !enabled);
    });
  }
});
