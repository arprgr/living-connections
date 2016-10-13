// app.js

define([ "jquery", "assertions" ], function($) {

  function start() {
    alert('start');
  }

  function call() {
    alert('call');
  }

  function hangup() {
    alert('hangup');
  }

  return function() {
    $("body")
      .append($("<h1>").text("WebRTC test app"))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
      .append($("<div>")
        .html("<video id='remoteVideo' autoplay></video>"))
      .append($("<div>")
        .append($("<button>").attr("id", "startButton").text("Start").click(start))
        .append($("<button>").attr("id", "callButton").text("Call").attr("disabled", true).click(call))
        .append($("<button>").attr("id", "hangupButton").text("Hang Up").attr("disabled", true).click(hangup)));
  }
});
