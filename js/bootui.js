// bootui.js

define([ "jquery" ], function($) {

  var NDOTS = 5;
  var PLACEMENT_TIME = 750;
  var FADE_TIME = 500;

  var ui;

  function render() {
    var dots = $("<div>").addClass("dots");

    for (var i = 0; i < NDOTS; ++i) {
      dots.append($("<canvas>").attr("id", "dot" + i).css("width", 40).css("height", 30));
    }

    ui = $("<div>")
      .addClass("startupScreen")
      .append($("<div>").addClass("logo"))
      .append($("<div>").css("height", 10))
      .append(dots);

    $("body").append(ui);
  }

  function erase() {
    ui.remove();
  }

  function drawCircle(canvasId, alpha) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY);
    var gradient = context.createRadialGradient(75,50,5,90,60,100);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "green");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = gradient;
    context.fill();
  }

  var stopped = false;

  function startAnimation() {
    stopped = false;

    for (var i = 0; i < NDOTS; ++i) {
      setTimeout((function(ix) {
        var startTime;
        var interval;
        var canvasId = "dot" + ix;
        return function() {
          startTime = new Date().getTime();
          interval = setInterval(function() {
            if (stopped) {
              clearInterval(interval);
            }
            else {
              var frame = ((new Date().getTime() - startTime) % 2500) / 25;
              var alpha = Math.max(0, (50 - frame) / 50);
              drawCircle(canvasId, alpha);
            }
          }, 25);
        };
      })(i), (i + 1) * 750);
    }
  }

  function stopAnimation() {
    stopped = true;
  }

  return {
    render: render,
    erase: erase,
    startAnimation: startAnimation,
    stopAnimation: stopAnimation
  }
});
