// greviewer.js - Greeting Viewer component

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
      var greeting = actionItem.greeting;
      self.videoPlayer.load(greeting.asset.url, { autoplay: true });
      if (greeting.fromUser) {
        addButton("Reply to " + greeting.fromUser.name, function() {
          self.openActionItem(new ActionItem({ type: "gre-cre", user: greeting.fromUser, isReply: 1 }));
        });
      }
      if (greeting.fromUser && greeting.fromUser.asset) {
        addButton("See " + greeting.fromUser.name + "'s Profile", function() {
          self.openActionItem(new ActionItem({ type: "pro-rec", user: greeting.fromUser }));
        });
      }
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });
  });
});
