// msgviewer.js - Mesage Viewer component

define([ "jquery", "activityui", "videoui", "button", "actionitem" ],
  function($, Activity, VideoPlayer, Button, ActionItem) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoPlayer = new VideoPlayer(); 

      self.container
        .append(videoPlayer.container)
        .append($("<div>").addClass("formsect").addClass("buttons"))

      self.videoPlayer = videoPlayer;
    });

    c.defineFunction("open", function(actionItem) {
      var self = this;

      function addButton(label, onClick) {
        var button = Button.create(label, onClick);
        button.container.appendTo(self.container.find(".buttons"));
      }

      Activity.prototype.open.call(self, actionItem);

      self.title = actionItem.title;
      var message = actionItem.message;
      self.videoPlayer.load(message.asset.url, { autoplay: true });

      if (actionItem.type.match(/inv-/)) {
        addButton("Accept " + message.fromUser.name + "'s invitation to connect", function() {
        });
        addButton("No, thanks", function() {
          self.exit();
        });
      }
      addButton("Reply to " + message.fromUser.name, function() {
        self.openActionItem(new ActionItem({ type: "gre-cre", user: message.fromUser, isReply: 1 }));
      });
      if (message.fromUser.asset) {
        addButton("See " + message.fromUser.name + "'s Profile", function() {
          self.openActionItem(new ActionItem({ type: "pro-rec", user: message.fromUser }));
        });
      }
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });
  });
});
