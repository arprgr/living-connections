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
          self.openActionItem({ type: "gre-cre", user: announcement.creator });
        });
      }
      if (announcement.creator && announcement.creator.asset) {
        addButton("See " + announcement.creator.name + "'s Profile", function() {
          self.openActionItem({ type: "pro-rec", user: announcement.creator });
        });
      }
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });

    c.defineFunction("openActionItem", function(actionItem) {
      this.dispatchEvent("openActionItem", actionItem);
    });

    c.defineFunction("exit", function() {
      this.invokePlugin("exit");
    });
  });
});
