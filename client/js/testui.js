// testui.js

define([ "jquery", "ui/index", "waitanim"], function($, ui, WaitAnim) {

  function Test() {
  }

  Test.prototype = {
    open: function() {
      var self = this;
      var waitAnim = new WaitAnim();
      var radioGroup = new ui.RadioGroup($("<div>"), {
        choices: [
          { label: "Do (a deer)", value: 1 },
          { label: "Re", value: 2 },
          { label: "Mi", value: 3, checked: 1 },
          { label: "Fa", value: 4 }
        ],
        groupName: "group1"
      });

      $("body")
        .empty()
        .append(waitAnim.container)
        .append($("<div>")
          .addClass("buttons")
          .append(ui.Button.create("Start", function() {
            radioGroup.apparentValue = 2;
            waitAnim.start();
          }).container)
          .append(ui.Button.create("Stop", function() {
            radioGroup.apparentValue = 6;
            waitAnim.stop();
          }).container)
        )
        .append(radioGroup.container);

      console.log(radioGroup.value);
      radioGroup.addChangeListener(function(value) {
        console.log('change', value);
      });

      return self;
    }
  }

  return Test;
});
