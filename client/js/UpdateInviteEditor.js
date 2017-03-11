// UpdateInviteEditor.js - enable creator of invitation to swap video, resend, or cancel.

define([ "jquery", "services", "Activity", "VideoRecorder", "ui/index" ],
function($,        Services,   Activity,   VideoRecorder, ui) {

  return Activity.defineClass(function(c) {

    function initControls(self) {

      function buttonsEnabled(enabled) {
        self.resendButton.enabled = enabled;
        self.deleteButton.enabled = enabled;
      }

      function resendInvite() {
        buttonsEnabled(false);
        Services.apiService.resendInvite(self.actionItem.invite.id)
        .then(function() {
          Services.sessionManager.refreshNow();
          self.exit();
        })
        .catch(function(err) {
          buttonsEnabled(true);
          console.log(err);
        })
      }

      function deleteInvite() {
        buttonsEnabled(false);
        Services.apiService.saveForm("inv", "del", self.actionItem.invite)
        .then(function() {
          Services.sessionManager.refreshNow();
          self.exit();
        })
        .catch(function(err) {
          buttonsEnabled(true);
          console.log(err);
        })
      }

      self.videoRecorder = new VideoRecorder("<div>", {
        what: "invitation"
      }).addPlugin(self);

      self.resendButton = ui.Button.create("Resend it", resendInvite);
      self.videoRecorder.addControl(VideoRecorder.STATE_PREVIEW, self.resendButton);

      self.deleteButton = ui.ConfirmButton.create("Delete it", deleteInvite);
      self.videoRecorder.addControl(VideoRecorder.STATE_PREVIEW, self.deleteButton);
    }

    c.defineInitializer(function() {
      initControls(this);
      this.ele.append(this.videoRecorder.ele)
    });

    c.defineProperty("invite", {
      get: function() {
        return this.actionItem.invite;
      }
    });

    c.extendPrototype({
      open: function() {
        this.videoRecorder.open(this.invite.asset && this.invite.asset.url);
        return this;
      },
      saveMessage: function(assetId) {
        return this.saveForm({
          id: this.invite.id,
          assetId: assetId
        });
      },
      close: function() {
        this.videoRecorder.close();
        return this;
      }
    });
  });
});
