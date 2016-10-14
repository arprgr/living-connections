// app.js

define([ "jquery", "vid", "assertions" ], function($, vid) {

  return function() {

    var vidController = vid.newController();

    function start() {
      vidController.start();
    }

    function call() {
      vidController.call();
    }

    function hangup() {
      vidController.hangup();
    }

    var
      startButton =
        $("<button>").text("Start").click(start),
      callButton =
        $("<button>").text("Call").attr("disabled", true).click(call),
      hangupButton =
        $("<button>").text("Hang Up").attr("disabled", true).click(hangup);

    vidController.onChangeStartEnabled(function(enabled) {
      startButton.attr("disabled", !enabled);
    });
    vidController.onChangeCallEnabled(function(enabled) {
      callButton.attr("disabled", !enabled);
    });
    vidController.onChangeHangupEnabled(function(enabled) {
      hangupButton.attr("disabled", !enabled);
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

    vidController.setLocalVideo(document.getElementById('localVideo'));
    vidController.setRemoteVideo(document.getElementById('remoteVideo'));
    vidController.init();
  }
});
