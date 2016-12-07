// waitanim.js

define([ "jquery", "fadedot" ], function($, FadeDotController) {

  var NDOTS = 7;
  var PAUSE = 700;

  function selectContainer() {
    return $("#startup .waiting");
  }

  function isRendered() {
    return selectContainer().children().length;
  }

  function render() {
    for (var i = 0; i < NDOTS; ++i) {
      $("<canvas>")
        .attr("id", "dot" + i)
        .attr("width", 18)
        .attr("height", 18)
        .addClass("dot")
        .appendTo(selectContainer());
    }
  }

  function Controller() {
    var self = this;
    self.dots = [];
    for (var i = 0; i < NDOTS; ++i) {
      self.dots.push(new FadeDotController("dot" + i));
    }
  }

  Controller.prototype = {
    show: function() {
      if (!isRendered()) {
        render();
      }
      else {
        selectContainer().show();
      }
      return this;
    },
    hide: function() {
      selectContainer().hide();
    },
    start: function start() {
      var self = this;
      var index = 0;
      (function kickOffNext() {
        self.dots[index].start();
        self.timeout = setTimeout(kickOffNext, PAUSE);
      })();
      return self;
    },
    stop: function() {
      var self = this;
      if (self.running) {
        clearTimeout(self.timeout);
        for (var i = 0; i < NDOTS; ++i) {
          self.dots.stop();
        }
        self.running = false;
      }
      return self
    }
  }

  return Controller;
});
