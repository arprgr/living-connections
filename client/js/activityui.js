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

    c.defineFunction("open", function(actionItem) {
      var self = this;
      self.container.find("img.lilIcon").attr("src", actionItem.iconUri || "");
      self.container.find("span.title").text(actionItem.title || "");
    });

    c.defineFunction("close", function() {
    });

    c.defineFunction("openActionItem", function(actionItem) {
      this.invokePlugin("openActionItem", actionItem);
    });

    c.defineFunction("exit", function() {
      this.invokePlugin("exit");
    });
  });
});
