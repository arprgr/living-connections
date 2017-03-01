// CreateInviteEditor.js - New invitation editor

define([ "jquery", "activityui", "VideoRecorder", "ui/index" ],
function($,        Activity,     VideoRecorder,   ui) {

  var NameAndEmailEditor = ui.Carton.defineClass(function(c) {

    function makeErrorLabel(text) {
      return new ui.Component("<span>", { cssClass: "error" }).setText(text).setVisible(false);
    }

    c.defineProperty("email", {
      get: function() {
        return this.emailInput.value;
      }
    });

    c.defineProperty("name", {
      get: function() {
        return this.nameInput.value;
      }
    });

    c.defineInitializer(function() {
      var self = this;

      function updateOkEnabled() {
        self.okButton.enabled = self.emailInput.valid && self.nameInput.value;
      }

      function makeInput(cons, placeholder) {
        var input = new cons()
          .setPlaceholder(placeholder)
          .addPlugin({
            onChange: function() {
              input.input.removeClass("invalid");
            },
            onFocus: function() {
              self.okButton.enabled = true;
            },
            onError: function() {
              input.input.addClass("invalid");
            },
            onBlur: function() {
              if (!input.valid) {
                self.invokePlugin("onError");
              }
              updateOkEnabled();
            }
          });
        return input;
      }

      self.nameInput = makeInput(ui.TextInput, "name")
        .addPlugin({
          onChange: function() {
            self.nameError.visible = false;
          },
          onError: function() {
            self.nameError.visible = true;
          }
        });

      self.nameError = makeErrorLabel(" Name is required.");

      self.emailInput = makeInput(ui.EmailInput, "email address")
        .addPlugin({
          onChange: function() {
            self.emailError.visible = false;
          },
          onError: function() {
            self.emailError.visible = true;
          }
        });

      self.emailError = makeErrorLabel(" A valid email address is required.");

      self.okButton = ui.Button.create("Record a message", function() {
        self.invokePlugin("openVideoRecorder");
      })

      self.ele
        .append($("<div>").addClass("panel")
          .append($("<div>")
            .text("Give us a name and an email address, and we'll send an invitation in your name."))
          .append($("<div>")
            .text("The invitation email contains a link that your contact can use to sign into " +
              "Living Connections and connect with you."))
          .append($("<div>")
            .append(self.nameInput.ele)
            .append(self.nameError.ele))
          .append($("<div>")
            .append(self.emailInput.ele)
            .append(self.emailError.ele))
          .append($("<div>")
            .append(self.okButton.ele))
        )

    });

    c.extendPrototype({
      open: function() {
        var self = this;
        setTimeout(function() {
          self.nameInput.focus().select();
        }, 100);
        return self;
      }
    });
  });

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var nameAndEmailEditor = new NameAndEmailEditor();

      var videoRecorder = new VideoRecorder("<div>", {
        what: "invitation"
      }).addPlugin(self);

      self.ele
        .append(nameAndEmailEditor.ele)
        .append(videoRecorder.ele)

      self.nameAndEmailEditor = nameAndEmailEditor;
      self.videoRecorder = videoRecorder;
    });

    function open() {
        this.videoRecorder.open();
    }

    c.extendPrototype({
      open: function() {
        this.nameAndEmailEditor.open();
        return this;
      },
      saveMessage: function(assetId) {
        return this.saveForm($.extend({}, this.data, {
          assetId: assetId,
          email: this.nameAndEmailEditor.email,
          name: this.nameAndEmailEditor.name,
          endDate: this.endDatePicker.value
        }));
      },
      close: function() {
        this.videoRecorder.close();
        return this;
      }
    });
  });
});
