// GreetingEditor.js - Editor for general messages.

define([ "Activity", "VideoRecorder" ],
function(Activity,     VideoRecorder) {

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var videoRecorder = new VideoRecorder().addPlugin(self);
      self.ele.append(videoRecorder.ele);
      self.videoRecorder = videoRecorder;
    });

    c.extendPrototype({
      open: function() {
        this.videoRecorder.open();
        return this;
      },
      saveMessage: function(assetId) {
        return this.saveForm({ toUserId: this.actionItem.user.id, assetId: assetId });
      },
      close: function() {
        this.videoRecorder.close();
        return this;
      }
    });
  });
});
