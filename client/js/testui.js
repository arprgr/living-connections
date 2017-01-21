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
          { label: "Do (a deer)", value: 0 },
          { label: "Re", value: 1 },
          { label: "Mi", value: 2, checked: 1 },
          { label: "Fa", value: 3 }
        ],
        groupName: "group1"
      });

      var label0 = new ui.Component().setText("LABEL 0");
      var label1 = new ui.Component().setText("LABEL 1");
      var fadeGoal = new ui.FadeGoal();

      radioGroup.addChangeListener(function(value) {
        waitAnim.start();
        fadeGoal.addGoal(label0, value == 3 || value == 2);
        fadeGoal.addGoal(label1, value == 1 || value == 3).then(function() { waitAnim.stop(); });
      });

      $("body")
        .empty()
        .append(waitAnim.container)
        .append(label0.container)
        .append(label1.container)
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

      return self;
    }
  }

  return Test;
});
