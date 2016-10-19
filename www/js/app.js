// app.js

define([ "jquery", "utils", "vid", "assertions" ], function($, u, vid) {

  return function() {

    var localVideoController, remoteVideoController;
    var startTime;

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
          startTime = window.performance.now();
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
        .append(openButton)
        .append(closeButton)
        .append(callButton)
        .append(hangupButton))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
      .append($("<div>")
        .html("<video id='remoteVideo' autoplay></video>"));

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

    remoteVideo.onresize = function() {
      u.trace('Remote video size changed to ' +
        remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
      // We'll use the first onresize callback as an indication that video has started
      // playing out.
      if (startTime) {
        var elapsedTime = window.performance.now() - startTime;
        u.trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
      }
    };

    localVideoController.onChangeOpenEnabled(function(enabled) {
      openButton.attr("disabled", !enabled);
    });
    localVideoController.onChangeStream(function(stream) {
      remoteVideoController.setSourceStream(stream);
      localVideo.srcObject = stream;
      remoteVideo.srcObject = null;
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
