// ConnectionViewer.js - Component for recording and viewing messages to/from a connection.

define([ "jquery", "Activity", "ui/index", "ActionItem", "Services" ],
function($,        Activity,     ui,       ActionItem,   Services) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.videoPlayer = new ui.Video(); 

      self.ele
        .append($("<div>").addClass("body")
          .addClass("panel")
          .append($("<div>")
            .append($("<div>").addClass("buttons").css({ float: "left", width: 100 }))
            .append(self.videoPlayer.ele))
          )
      self.videoPlayer.ele.css({ "margin": "auto" });
    });

    function addThumb(self, url, onClick) {
      var img = new ui.Image().setSrc(url);
      img.ele.addClass("thumb").appendTo(self.ele.find(".buttons"));
      img.addPlugin({
        onClick: onClick
      });
    }

    function addButton(self, label, onClick) {
      var button = ui.Button.create(label, onClick);
      button.ele.appendTo(self.ele.find(".buttons"));
    }

    function addReplyButton(self, fromUser) {
      addButton(self, "Reply", function() {
      });
    }

    c.extendPrototype({
      open: function() {
        var self = this;
        var actionItem = self.actionItem;

        if (actionItem.thread && actionItem.thread.length) {
          var latestMessage = actionItem.thread[0];
          self.videoPlayer.load(latestMessage.asset.url, { autoplay: true });
        }

        addThumb(self, "/img/plus.png", function() {
          console.log('clicked');
        });

        for (var i = 0; i < actionItem.thread.length; ++i) {
          var message = actionItem.thread[i];
          addThumb(self, actionItem.thread[i].asset.thumbnailUrl, function() {
            console.log('clicked');
          });
        }

        return self;
      }
    });
  });
});
