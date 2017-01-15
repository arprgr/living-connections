// listingui.js

define([ "jquery", "component", "services" ], function($, Component, Services) {

  function renderItem(self, actionItem) {
    return $("<div>")
      .addClass("item")
      .append($("<img>")
        .addClass("bigIcon")
        .attr("src", actionItem.iconUri))
      .append($("<div>")
        .addClass("title")
        .text(actionItem.title))
      .click(function() {
        self.invokePlugin("openActionItem", actionItem);
      })
  }

  function render(self) {
    var container = self.container.empty()      // TODO: render incrememtally.
    var actionItems = self.actionItems;
    if (actionItems) {
      for (var i = 0; i < actionItems.length; ++i) {
        container.append(renderItem(self, actionItems[i]));
      }
    }
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      this.container.addClass("listing");
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        self.actionItems = Services.sessionManager.actionItems.value;
        render(self);
        self.closeHandle = Services.sessionManager.addActionListener(function(actionItems) {
          self.actionItems = actionItems;
          render(self);
        });
        return this;
      },

      close: function() {
        var self = this;
        if (self.closeHandle) {
          self.closeHandle.undo();
          self.closeHandle = null;
        }
        return self;
      }
    });
  });
});
