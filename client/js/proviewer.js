// proviewer.js - Profile Viewer component

define([ "jquery", "activityui", "videoui", "button", "actionitem" ],
  function($, Activity, VideoPlayer, Button, ActionItem) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoPlayer = new VideoPlayer(); 

      self.container
        .append(videoPlayer.container)
        .append($("<div>").addClass("buttons"))

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
      var user = actionItem.user;
      self.videoPlayer.load(user.asset.url, { autoplay: true });
      addButton("Send a greeting to " + user.name, function() {
        self.openActionItem(new ActionItem({ type: "gre-cre", user: user }));
      });
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });
  });
});
