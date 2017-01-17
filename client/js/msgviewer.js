// msgviewer.js - Mesage Viewer component

define([ "jquery", "activityui", "ui/index", "actionitem" ], function($, Activity, ui, ActionItem) {

  var Button = ui.Button;
  var VideoPlayer = ui.Video;

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoPlayer = new VideoPlayer(); 

      self.container
        .append($("<div>")
          .addClass("panel")
          .append(videoPlayer.container)
          .append($("<div>").addClass("formsect").addClass("buttons")))

      self.videoPlayer = videoPlayer;
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;

        function addButton(label, onClick) {
          var button = Button.create(label, onClick);
          button.container.appendTo(self.container.find(".buttons"));
        }

        Activity.prototype.open.call(self, actionItem);

        self.title = actionItem.title;
        var message = actionItem.message || actionItem.user;
        self.videoPlayer.load(message.asset.url, { autoplay: true });

        var fromUser = message.fromUser;
        if (fromUser) {
          if (actionItem.type.match(/inv-/)) {
            addButton("Accept " + fromUser.name + "'s invitation to connect", function() {
            });
            addButton("No, thanks", function() {
              self.exit();
            });
          }
          addButton("Reply to " + fromUser.name, function() {
            self.openActionItem(new ActionItem({ type: "gre-cre", user: fromUser, isReply: 1 }));
          });
          if (fromUser.asset) {
            addButton("See " + fromUser.name + "'s Profile", function() {
              self.openActionItem(new ActionItem({ type: "pro-rec", user: fromUser }));
            });
          }
        }

        return self;
      }
    });
  });
});
