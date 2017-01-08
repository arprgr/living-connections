// activityui.js - ActivityComponent

define([ "jquery", "component" ], function($, Component) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container 
        .append($("<img>").addClass("lilIcon"))
        .append($("<a>")
          .addClass("exit")
          .text("Exit")
          .attr("href", "#")
          .click(function() {
            self.onActivityClose && self.onActivityClose();
          }))
        .append($("<div>").addClass("form"))
    });

    function updateHeader(self) {
      self.container.find(".lilIcon").attr("src", self.actionItem.iconUri);
    }

    c.defineFunction("open", function(actionItem) {
      var self = this;
      var parts = actionItem.type.split("-");
      self.what = parts[0];
      self.action = parts[1];
      self.sender = actionItem.sender;
      updateHeader(self);
      return self;
    });

    c.defineFunction("close", function(actionItem) {
      var self = this;
      var parts = actionItem.type.split("-");
      self.what = parts[0];
      self.action = parts[1];
      self.sender = actionItem.sender;
      updateHeader(self);
      return self;
    });
  });
});
