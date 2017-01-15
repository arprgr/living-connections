// proeditor.js - Profile Editor component

define([ "jquery", "services", "activityui", "textinput", "vidrec", "button", "slideform" ],
  function($, Services, Activity, TextInput, VideoRecorder, Button, SlideForm) {

  // Service imports.

  var apiService = Services.apiService;

  var ProfileNameForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var nameInput = new TextInput($("<div>"));
      nameInput.addPlugin({
        submit: function(name) {
          self.data.name = name;
          self.advance();
        }
      });

      var forwardButton = Button.create("Keep Going", function() {
        nameInput.submit();
      });

      nameInput.valid.addChangeListener(function(isValid) {
        forwardButton.enabled = isValid;
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .addClass("formsect")
          .text("What name would you like to go by in Living Connections?"))
        .append($("<div>")
          .addClass("formsect")
          .append(nameInput.container))
        .append($("<div>")
          .addClass("formsect")
          .append(forwardButton.container)
          .append(cancelButton.container))

      self.nameInput = nameInput;
    });

    c.extendPrototype({
      open: function(data) {
        var self = this;
        self.data = data;
        self.nameInput.value = data.name;
        setTimeout(function() {
          self.nameInput.select().focus();
        }, 100);
      }
    });
  });

  var ProfileSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = Button.create("Done", function() {
        doneButton.enabled = false;
        apiService.saveForm("pro", "upd", self.data)
        .then(function() {
          self.exit();
        })
        .catch(function(err) {
          console.log(err);
        });
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .text("Press Done to submit your profile, or Cancel to throw it out."))
        .append($("<div>")
          .append(doneButton.container)
          .append(cancelButton.container))
    });
  });

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var form = new SlideForm($("<div>").addClass("form"), {
        slides: [
          ProfileNameForm,
          VideoRecorder,
          ProfileSubmitForm
        ]
      })
      form.addPlugin(self);
      self.container.append(form.container);
      self.form = form;
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        Activity.prototype.open.call(self, actionItem);
        self.form.open(actionItem.user);
      }
    });
  });
});
