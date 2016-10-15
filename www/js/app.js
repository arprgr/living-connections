// app.js

define([ "jquery", "vid", "assertions" ], function($, vid) {

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

    // jQuery seems unable to manufacture <video> elements.
    var localVideoController = vid.newLocalVideoController(document.getElementById('localVideo'));
    var remoteVideoController = vid.newRemoteVideoController(document.getElementById('remoteVideo'));

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
