// MessageViewer.js - Mesage Viewer component

define([ "jquery", "Activity", "ui/index", "ActionItem", "services" ],
function($,        Activity,     ui,       ActionItem,   Services) {

  var Button = ui.Button;
  var VideoPlayer = ui.Video;

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoPlayer = new VideoPlayer(); 

      self.container
        .append($("<div>").addClass("body")
          .addClass("panel")
          .append(videoPlayer.container)
          .append($("<div>").addClass("formsect").addClass("buttons")))

      self.videoPlayer = videoPlayer;
    });

    function addButton(self, label, onClick) {
      var button = Button.create(label, onClick);
      button.container.appendTo(self.container.find(".buttons"));
    }

    function addButtons(self, fromUser) {
      addButton(self, "Reply to " + fromUser.name, function() {
        self.openOther(new ActionItem({ id: "gre-cre", user: fromUser, isReply: 1 }));
      });
      if (fromUser.asset) {
        addButton(self, "See " + fromUser.name + "'s Profile", function() {
          self.openOther(new ActionItem({ id: "pro-rec", user: fromUser }));
        });
      }
    }

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        var actionItem = self.options.actionItem;
        var message = actionItem.message || actionItem.user;
        self.videoPlayer.load(message.asset.url, { autoplay: true });
        if (actionItem.user) {
          addButtons(self, actionItem.user);
        }
        return Activity.prototype.open.call(self);
      }
    });
  });
});
