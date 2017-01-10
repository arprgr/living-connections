// annviewer.js - Announcement Viewer component

define([ "jquery", "component", "services", "videoui", "button" ],
  function($, Component, Services, VideoPlayer, Button) {

  // Service imports.

  var apiService = Services.apiService;

  return Component.defineClass(function(c) {

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
        var button = new Button($("<button>").addClass("standard")).setLabel(label).onClick(onClick);
        button.container.appendTo(self.container.find(".buttons"));
      }

      self.title = actionItem.title;
      var announcement = actionItem.announcement;
      self.videoPlayer.load(announcement.asset.url, { autoplay: true });
      self.container.find("button").remove();
      if (announcement.creator) {
        addButton("Reply to " + announcement.creator.name, function() {
          self.context.openActionItem({ type: "pro-rec", user: announcement.creator });
        });
      }
      if (announcement.creator && announcement.creator.asset) {
        addButton("See " + announcement.creator.name + "'s Profile", function() {
          self.context.openActionItem({ type: "pro-rec", user: announcement.creator });
        });
      }
      addButton("Exit", function() {
        self.context.exit();
      });

      return self;
    });
  });
});
