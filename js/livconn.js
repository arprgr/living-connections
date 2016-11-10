// livconn.js

define([ "jquery" ], function($) {

  function render() {
    var dots = $("<div>").addClass("dots");

    for (var i = 0; i < 4; ++i) {
      dots.append($("<canvas>").attr("id", "dot" + i).css("height", 50));
    }

    $("body")
      .append($("<div>")
        .attr("ng-controller", "StartupController")
        .addClass("startupScreen")
        .append($("<div>").addClass("logo"))
        .append($("<div>").css("height", 10))
        .append(dots));
  }
  render();

  function clearCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawCircle(canvasId, c1, c2, alpha) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = Math.min(centerX, centerY);
    var gradient = context.createRadialGradient(75,50,5,90,60,100);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = gradient;
    context.fill();
  }

  var done = false;

  function signalTermination() {
    done = true;
  }

  function StartupController() {
    setTimeout(signalTermination, 15000);
    for (var i = 0; i < 4; ++i) {
      setTimeout((function(ix) {
        var startTime;
        var interval;
        var canvasId = "dot" + ix;
        return function() {
          startTime = new Date().getTime();
          interval = setInterval(function() {
            clearCanvas(canvasId);
            if (done) {
              clearInterval(interval);
            }
            else {
              var frame = ((new Date().getTime() - startTime) % 2500) / 25;
              var alpha = Math.max(0, (50 - frame) / 50);
              drawCircle(canvasId, "white", "green", alpha);
            }
          }, 25);
        };
      })(i), (i + 1) * 750);
    }
  }

  return function() {
    angular.module("Startup", [])
      .controller("StartupController", [ StartupController ]);
    angular.bootstrap(document, [ "Startup" ]);
  }
});
