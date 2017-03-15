// ConnectionViewer.js - Component for recording and viewing messages to/from a connection.

define([ "jquery", "Activity", "ui/index", "ActionItem", "services" ],
function($,        Activity,     ui,       ActionItem,   Services) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.videoPlayer = new ui.Video(); 

      self.container
        .append($("<div>").addClass("body")
          .addClass("panel")
          .append(self.videoPlayer.ele)
          .append($("<div>").addClass("formsect").addClass("buttons")))
    });

    function addThumb(self, message) {
      var img = new ui.Image().setSrc(message.asset.thumbnailUrl);
      img.ele.appendTo(self.ele.find(".buttons"));
    }

    function addButton(self, label, onClick) {
      var button = ui.Button.create(label, onClick);
      button.ele.appendTo(self.ele.find(".buttons"));
    }

    function addReplyButton(self, fromUser) {
      addButton(self, "Reply to " + fromUser.name, function() {
        self.openOther(new ActionItem({ id: "gre-cre", user: fromUser, isReply: 1 }));
      });
    }

    c.extendPrototype({
      open: function() {
        var self = this;
        var actionItem = self.actionItem;

        if (actionItem.thread && actionItem.thread.length) {
          var latestMessage = actionItem.thread[0];
          self.videoPlayer.load(latestMessage.asset.url, { autoplay: true });
        }

        for (var i = 0; i < actionItem.thread.length; ++i) {
          addThumb(self, actionItem.thread[i]);
        }

        if (actionItem.user) {
          addReplyButton(self, actionItem.user);
        }

        return self;
      }
    });
  });
});
