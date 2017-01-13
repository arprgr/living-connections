// invviewer.js - Greeting Viewer component

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
      var invite = actionItem.invite;
      self.videoPlayer.load(invite.asset.url, { autoplay: true });
      addButton("Accept " + invite.fromUser.name + "'s invitation to connect", function() {
      });
      addButton("No, thanks", function() {
        self.exit();
      });
      addButton("Reply to " + invite.fromUser.name, function() {
        self.openActionItem(new ActionItem({ type: "gre-cre", user: invite.fromUser, isReply: 1 }));
      });
      if (invite.fromUser.asset) {
        addButton("See " + invite.fromUser.name + "'s Profile", function() {
          self.openActionItem(new ActionItem({ type: "pro-rec", user: invite.fromUser }));
        });
      }
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });
  });
});
