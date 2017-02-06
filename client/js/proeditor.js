// proeditor.js - Profile Editor component

define([ "jquery", "editor", "ui/index", "fblogin",     "vidrec" ],
function($,        Editor,   ui,         FacebookLogin, VideoRecorder) {

  //
  // Name section
  //
  var ProfileNameCell = Editor.Cell.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: [ "name" ]
    });

    c.defineInitializer(function() {
      var self = this;

      var nameInput = new ui.TextInput().addPlugin({
        submit: function(name) {
          self.data.name = name;
          self.advance();
        }
      });

      var okButton = ui.Button.create("OK", function() {
        nameInput.submit();
      });

      nameInput.addChangeListener(function() {
        okButton.enabled = nameInput.valid;
      });

      self.form.container
        .append($("<div>")
          .text("What name would you like to go by in Living Connections?"))
        .append($("<div>")
          .append(nameInput.container)
          .append(okButton.container));

      self.nameInput = nameInput;
    });

    c.extendPrototype({
      openForm: function() {
        var self = this;
        self.nameInput.value = self.data.name;
        setTimeout(function() {
          self.nameInput.select().focus();
        }, 100);
      },
      summarize: function() {
        return "Your name is " + (this.data.name || "not set");
      }
    });
  });

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
        ProfileNameCell,
        ProfileFacebookCell,
        { cons: VideoRecorder, options: { prompt: "Add a videogram to your profile" } }
      ]
    });

    c.defineInitializer(function() {
      if (this.actionItem.user.facebookProfile) {
        this.cells[1].visible = false;
      }
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.user;
      }
    });
  });
});
