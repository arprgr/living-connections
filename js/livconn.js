// livconn.js

define([ "jquery" ], function($) {

  $("body")
    .append($("<div>")
      .addClass("startupScreen")
      .append($("<div>").addClass("logo"))
      .append($("<div>").css("height", 10))
      .append($("<div>").addClass("dots").append($("<canvas>").attr("id", "theCanvas").css("height", 50)))
    );

  function drawCircle(canvasId, color) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
  }

  var done = false;

  function signalTermination() {
    done = true;
  }

  var interval;
  var count = 0;

  function animationStep() {
    if (done) {
      clearInterval(interval);
      $("#theCanvas").remove();
    }
    else {
      drawCircle("theCanvas", count++ % 2 == 0 ? "green" : "white");
    }
  }

  return function() {
    setTimeout(signalTermination, 5000);
    interval = setInterval(animationStep, 500);
  }
});
