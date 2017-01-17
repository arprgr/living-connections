// proeditor.js - Profile Editor component

define([ "jquery", "editor", "ui/index", "vidrec" ],
  function($, Editor, ui, VideoRecorder) {

  var ProfileNameForm = Editor.Form.defineClass(function(c) {

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

      nameInput.valid.addChangeListener(function(isValid) {
        okButton.enabled = isValid;
      });

      self.container
        .append($("<div>")
          .addClass("expanded")
          .text("What name would you like to go by in Living Connections?"))
        .append($("<div>")
          .addClass("expanded")
          .append(nameInput.container)
          .append(okButton.container));

      self.nameInput = nameInput;
    });

    c.extendPrototype({
      render: function(expanded) {
        var self = this;
        Editor.Form.prototype.render.call(self, expanded);
        if (expanded) {
          self.nameInput.value = self.data.name;
          setTimeout(function() {
            self.nameInput.select().focus();
          }, 100);
        }
      },
      _renderSummary: function() {
        return "Your name is " + (this.data.name || "not set");
      }
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      forms: [ ProfileNameForm, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.user;
      }
    });
  });
});
