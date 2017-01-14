// testui.js

define([ "jquery", "button", "waitanim"], function($, Button, WaitAnim) {

  function Test() {
  }

  Test.prototype = {
    open: function() {
      var self = this;
      var waitAnim = new WaitAnim();

      $("body")
        .empty()
        .append(waitAnim.container)
        .append($("<div>")
          .addClass("buttons")
          .append(Button.create("Start", function() {
            waitAnim.start();
          }).container)
          .append(Button.create("Stop", function() {
            waitAnim.stop();
          }).container)
        )

      return self;
    }
  }

  return Test;
});
