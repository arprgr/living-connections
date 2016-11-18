// waitanim.js

define([ "jquery", "fadedot" ], function($, fadedot) {

  var NDOTS = 7;
  var PAUSE = 700;

  // UI lifecycle methods

  function selectContainer() {
    return $("#startup .waiting");
  }

  function uiIsRendered() {
    return selectContainer().children().length;
  }

  function renderUi() {
    for (var i = 0; i < NDOTS; ++i) {
      $("<canvas>")
        .attr("id", "dot" + i)
        .attr("width", 18)
        .attr("height", 18)
        .addClass("dot")
        .appendTo(selectContainer());
    }
  }

  function hideUi() {
    selectContainer().hide();
  }

  function showUi() {
    selectContainer().show();
  }

  // Class Controller

  function Controller() {
    var self = this;
    self.dots = [];
    for (var i = 0; i < NDOTS; ++i) {
      self.dots.push(new fadedot.Controller("dot" + i));
    }
  }

  function show() {
    if (!uiIsRendered()) {
      renderUi();
    }
    else {
      showUi();
    }
    return this;
  }

  function hide() {
    hideUi();
  }

  function start() {
    var self = this;
    var index = 0;
    (function kickOffNext() {
      self.dots[index].start();
      self.timeout = setTimeout(kickOffNext, PAUSE);
    })();
    return self;
  }

  function stop() {
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

  Controller.prototype = {
    show: show,
    hide: hide,
    start: start,
    stop: stop
  }

  return {
    Controller: Controller
  }
});
