// activityui.js - ActivityComponent.  A base component class.
// All activity views have a header containing an icon, a title, and a cancel/exit link.

define([ "jquery", "ui/component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineDefaultOptions({
      exitLinkText: "Exit",
      actionItem: {}
    });

    c.defineInitializer(function() {
      var self = this;
      var actionItem = self.options.actionItem;
      self.container
        .addClass("activity")
        .append($("<div>")
          .addClass("header")
          .append($("<div>").addClass("icon").append($("<img>").attr("src", actionItem.iconUri)))
          .append($("<div>").addClass("title").append($("<span>").text(actionItem.title || "")))
          .append($("<div>").addClass("cancel")
            .append($("<a>")
              .text(self.options.exitLinkText)
              .attr("href", "#")
              .click(function() {
                self.exit();
              })
            )
          )
        );
    });

    c.extendPrototype({
      openOther: function(actionItem) {
        this.invokePlugin("openOther", actionItem);
      },

      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });
});
