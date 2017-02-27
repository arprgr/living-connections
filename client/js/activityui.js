// activityui.js - ActivityComponent.  A base component class.
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
      self.container
        .addClass("activity")
        .append($("<div>")
          .addClass("header")
          .append($("<div>").addClass("icon").append($("<img>").attr("src", actionItem.iconUri)))
          .append($("<div>").addClass("title").append($("<span>").text(actionItem.title || "")))
          .append($("<div>").addClass("cancel")
            .append(exitButton.ele)
          )
        );
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
