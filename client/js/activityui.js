// activityui.js - ActivityComponent

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container
        .addClass("activity")
        .append($("<div>")
          .addClass("header")
          .append($("<div>").addClass("icon").append($("<img>")))
          .append($("<div>").addClass("title").append($("<span>")))
          .append($("<div>").addClass("cancel")
            .append($("<a>")
              .text("Cancel")
              .attr("href", "#")
              .click(function() {
                self.exit();
              })
            )
          )
        )
        .append($("<div>").addClass("body"));
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        self.container.find(".icon img").attr("src", actionItem.iconUri || "");
        self.container.find(".title span").text(actionItem.title || "");
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
