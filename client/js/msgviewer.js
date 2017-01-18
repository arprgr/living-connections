// msgviewer.js - Mesage Viewer component

define([ "jquery", "activityui", "ui/index", "actionitem", "services" ],
function($,        Activity,     ui,         ActionItem,   Services) {

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

    function addButton(self, label, onClick) {
      var button = Button.create(label, onClick);
      button.container.appendTo(self.container.find(".buttons"));
    }

    function addInvitationButtons(self, fromUser) {
      addButton(self, "Accept " + fromUser.name + "'s invitation to connect", function() {
        Services.apiService.addConnection(fromUser.id)
        .then(function() {
          self.exit();
        })
        .catch(function(err) {
          console.log(err);
          self.exit();
        })
      });
      addButton(self, "No, thanks", function() {
        self.exit();
      });
    }

    function addButtons(self, fromUser) {
      addButton(self, "Reply to " + fromUser.name, function() {
        self.openActionItem(new ActionItem({ type: "gre-cre", user: fromUser, isReply: 1 }));
      });
      if (fromUser.asset) {
        addButton(self, "See " + fromUser.name + "'s Profile", function() {
          self.openActionItem(new ActionItem({ type: "pro-rec", user: fromUser }));
        });
      }
    }

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        Activity.prototype.open.call(self, actionItem);
        self.title = actionItem.title;
        var message = actionItem.message || actionItem.user;
        self.videoPlayer.load(message.asset.url, { autoplay: true });
        var fromUser = message.fromUser;
        if (fromUser) {
          if (actionItem.type.match(/inv-/)) {
            addInvitationButtons(self, fromUser);
          }
          addButtons(self, fromUser);
        }
        return self;
      }
    });
  });
});
