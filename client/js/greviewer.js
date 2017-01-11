// greviewer.js - Greeting Viewer component

define([ "jquery", "component", "videoui", "button", "actionitem" ],
  function($, Component, VideoPlayer, Button, ActionItem) {

  // Service imports.

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
      var greeting = actionItem.greeting;
      self.videoPlayer.load(greeting.asset.url, { autoplay: true });
      if (greeting.fromUser) {
        addButton("Reply to " + greeting.fromUser.name, function() {
          self.openActionItem({ type: "gre-cre", user: greeting.fromUser, isReply: 1 });
        });
      }
      if (greeting.fromUser && greeting.fromUser.asset) {
        addButton("See " + greeting.fromUser.name + "'s Profile", function() {
          self.openActionItem({ type: "pro-rec", user: greeting.fromUser });
        });
      }
      addButton("Exit", function() {
        self.exit();
      });

      return self;
    });

    c.defineFunction("close", function() {
    });

    c.defineFunction("openActionItem", function(actionItem) {
      this.invokePlugin("openActionItem", new ActionItem(actionItem));
    });

    c.defineFunction("exit", function() {
      this.invokePlugin("exit");
    });
  });
});
