// activityui.js - ActivityComponent

define([ "jquery", "component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container
        .addClass("activity")
        .append($("<div>")
          .append($("<img>").addClass("lilIcon"))
          .append($("<span>").addClass("title")))
    })

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        self.container.find("img.lilIcon").attr("src", actionItem.iconUri || "");
        self.container.find("span.title").text(actionItem.title || "");
        self.actionItem = actionItem;
      },

      close: function() {
      },

      openActionItem: function(actionItem) {
        this.invokePlugin("openActionItem", actionItem);
      },

      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });
});
