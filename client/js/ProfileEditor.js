// ProfileEditor.js - Profile video editor

define([ "jquery", "activityui", "ui/index", "VideoRecorder" ],
function($,        Activity,     ui,         VideoRecorder) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoRecorder = new VideoRecorder("<div>", {
        what: "profile video"
      }).addPlugin(self);
      self.ele.append(videoRecorder.ele);
      self.videoRecorder = videoRecorder;
    });

    c.defineProperty("url", {
      get: function() {
        var ai = this.actionItem;
        return ai && ai.user && ai.user.asset && ai.user.asset.url;
      }
    });

    c.extendPrototype({
      open: function() {
        this.videoRecorder.open(this.url);
        return this;
      },
      saveMessage: function(assetId) {
        return this.saveForm($.extend({}, this.actionItem.user, { assetId: assetId }));
      },
      close: function() {
        this.videoRecorder.close();
        return this;
      }
    });
  });
});
