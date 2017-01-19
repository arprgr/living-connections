// testui.js

define([ "jquery", "ui/index", "waitanim"], function($, ui, WaitAnim) {

  function Test() {
  }

  Test.prototype = {
    open: function() {
      var self = this;
      var waitAnim = new WaitAnim();
      new ui.Audio().load("audio/chime.wav").then(function(chime) {
        $("body")
          .empty()
          .append(chime.container)
          .append(waitAnim.container)
          .append($("<div>")
            .addClass("buttons")
            .append(ui.Button.create("Start", function() {
              chime.play();
              waitAnim.start();
            }).container)
            .append(ui.Button.create("Stop", function() {
              waitAnim.stop();
            }).container)
          )

      })
      return self;
    }
  }

  return Test;
});
