// listingui.js

define([ "jquery", "component", "services" ], function($, Component, Services) {

  function render(self) {
    var container = self.container.empty()      // TODO: render incrememtally.
    var actionItems = self.actionItems;
    if (actionItems) {
      for (var i = 0; i < actionItems.length; ++i) {
        var actionItem = actionItems[i];
        container.append($("<div>")
          .addClass("item")
          .append($("<img>")
            .addClass("bigIcon")
            .attr("src", actionItem.iconUri))
          .append($("<div>")
            .addClass("title")
            .text(actionItem.title))
          .click(function() {
            self.isOpen && self.onActionItemOpen && self.onActionItemOpen(actionItem);
          })
        );
      }
    }
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      Services.sessionManager.addActionListener(function(actionItems) {
        self.actionItems = actionItems;
        if (self.isOpen) {
          render(self);
        }
      });
    });

    c.defineFunction("open", function() {
      if (!this.isOpen) {
        render(this);
        this.isOpen = true;
      }
      return this;
    });

    c.defineFunction("close", function() {
      this.isOpen = false;
      return this;
    });
  });
});
