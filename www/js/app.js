// app.js

define([ "jquery", "vid", "assertions" ], function($, vid) {

  function createApp(vidController) {

    var startButton = $("<button>")
      .attr("id", "startButton")
      .text("Start")
      .click(function() { vidController.start() });
    var callButton = $("<button>")
      .attr("id", "callButton")
      .text("Call")
      .click(function() { vidController.call(); });
    var hangupButton = $("<button>")
      .attr("id", "hangupButton")
      .text("Hang Up")
      .click(function() { vidController.hangup(); });

    vidController.onChangeStartEnabled(function(startEnabled) {
      startButton.attr("disabled", !startEnabled);
    });
    vidController.onChangeCallEnabled(function(callEnabled) {
      callButton.attr("disabled", !callEnabled);
    });
    vidController.onChangeHangupEnabled(function(hangupEnabled) {
      hangupButton.attr("disabled", !hangupEnabled);
    });

    $("body")
      .append($("<h1>").text("WebRTC test app"))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
      .append($("<div>")
        .html("<video id='remoteVideo' autoplay></video>"))
      .append($("<div>")
        .append(startButton)
        .append(callButton)
        .append(hangupButton));

    vidController.setLocalVideo($("#localVideo"));
    vidController.setRemoteVideo($("#remoteVideo"));
    vidController.init();
  }

  return function() {
    createApp(vid.newController());
  }
});
