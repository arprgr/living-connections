// proeditor.js - Profile Editor component

define([ "jquery", "editor", "ui/index", "fblogin",     "vidrec" ],
function($,        Editor,   ui,         FacebookLogin, VideoRecorder) {

  //
  // Facebook section
  //
  var ProfileFacebookCell = Editor.Cell.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: [ "facebookProfile" ]
    });

    c.defineInitializer(function() {
      var self = this;

      var cancelButton = ui.Button.create("Not now", function() {
        self.advance();
      });

      var fbLogin = new FacebookLogin();

      self.form.container
        .append($("<div>")
          .text("Find your Facebook account"))
        .append($("<div>")
          .append(fbLogin.ele))
        .append($("<div>")
          .append(cancelButton.container));

      self.fbLogin = fbLogin;
    });

    c.extendPrototype({
      summarize: function() {
        return "You have not added a Facebook account";
      },
      open: function() {
        this.fbLogin.open();
        return this;
      }
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      cells: [
        //ProfileFacebookCell,
        { cons: VideoRecorder, options: { prompt: "Add a videogram to your profile" } }
      ]
    });

    c.defineInitializer(function() {
      //if (this.actionItem.user.facebookProfile) {
        //this.cells[1].visible = false;
      //}
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.user;
      }
    });
  });
});
