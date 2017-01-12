// annviewer.js - Announcement Viewer component

define([ "jquery", "activityui", "services", "videoui", "button", "actionitem" ],
  function($, Activity, Services, VideoPlayer, Button, ActionItem) {

  // Service imports.

  var apiService = Services.apiService;
  var sessionManager = Services.sessionManager;

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoPlayer = new VideoPlayer(); 

      self.container 
        .append($("<div>").addClass("form")
          .append(videoPlayer.container)
          .append($("<div>").addClass("buttons")))

      self.videoPlayer = videoPlayer;
    });

    c.defineFunction("open", function(actionItem) {
      var self = this;

      Activity.prototype.open.call(self, actionItem);

      function addButton(label, onClick) {
        var button = Button.create(label, onClick);
        button.container.appendTo(self.container.find(".buttons"));
      }

      var announcement = actionItem.announcement;
      self.videoPlayer.load(announcement.asset.url, { autoplay: true });
      self.container.find("button").remove();
      if (announcement.creator && announcement.creator.id != sessionManager.user.id) {
        addButton("Reply to " + announcement.creator.name, function() {
          self.openActionItem(new ActionItem({ type: "gre-cre", user: announcement.creator, isReply: 1 }));
        });
      }
      if (announcement.creator && announcement.creator.asset) {
        addButton("See " + announcement.creator.name + "'s Profile", function() {
          self.openActionItem(new ActionItem({ type: "pro-rec", user: announcement.creator }));
        });
      }

      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });
  });
});
