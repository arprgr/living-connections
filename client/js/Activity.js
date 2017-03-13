// Activity.js - base component class for all types of activity.
// All activity views have a header containing an icon, a title, and a cancel/exit link.

define([ "jquery", "ui/index", "services" ],
function($,        ui,         Services) {

  return ui.Component.defineClass(function(c) {

    c.defineDefaultOptions({
      exitLinkText: "Close",
      actionItem: {}
    });

    c.defineInitializer(function() {
      var self = this;
      var actionItem = self.options.actionItem;
      var exitButton = ui.Button.create(self.options.exitLinkText, function() {
        self.exit();
      });
      self.ele
        .addClass("activity")
        .append($("<div>")
          .addClass("header")
          .append($("<div>").addClass("icon").append($("<img>").attr("src", actionItem.iconUri)))
          .append($("<div>").addClass("title").append(actionItem.title))
          .append($("<div>").addClass("cancel")
            .append(exitButton.ele)
          )
        );
      self.ele.on("keyup", function(event) {
        var keyCode = event.originalEvent.keyCode;
        if (keyCode == 27) {
          self.exit();
        }
      });
    });

    c.defineProperty("actionItem", {
      get: function() {
        return this.options.actionItem;
      }
    });

    c.extendPrototype({
      openOther: function(actionItem) {
        this.invokePlugin("openOther", actionItem);
      },

      saveForm: function(data) {
        var actionItem = this.actionItem;
        return Services.apiService.saveForm(actionItem.what, actionItem.action, data)
        .then(function() {
          Services.sessionManager.refreshNow();
        });
      },

      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });
});
