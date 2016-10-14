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

    $("body")
      .append($("<h1>").text("WebRTC demo"))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
      .append($("<div>")
        .html("<video id='remoteVideo' autoplay></video>"))
      .append($("<div>")
        .append($("<button>").attr("id", "startButton").text("Start").click(start))
        .append($("<button>").attr("id", "callButton").text("Call").attr("disabled", true).click(call))
        .append($("<button>").attr("id", "hangupButton").text("Hang Up").attr("disabled", true).click(hangup)));

    vidController.setLocalVideo(document.getElementById('localVideo'));
    vidController.setRemoteVideo(document.getElementById('remoteVideo'));
  }
});
