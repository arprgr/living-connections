// listingui.js

define([ "jquery", "ui/component", "services" ], function($, Component, Services) {

  return Component.defineClass(function(c) {

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

    function render(self, actionItems) {
      var container = self.container.empty()      // TODO: render incrememtally.
      var lastBatch = self.lastBatch;
      var newBatch = {};
      if (actionItems) {
        for (var i = 0; i < actionItems.length; ++i) {
          var actionItem = actionItems[i];
          var itemView = renderItem(self, actionItem);
          container.append(itemView);
          if (lastBatch && !(actionItem.id in lastBatch)) {
            itemView.addClass("new");
          }
          newBatch[actionItem.id] = actionItem;
        }
      }
      self.lastBatch = newBatch;
    }

    c.defineInitializer(function() {
      this.container.addClass("listing");
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        render(self, Services.sessionManager.actionItems.value);
        self.closeHandle = Services.sessionManager.addActionListener(function(actionItems) {
          render(self, actionItems);
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
