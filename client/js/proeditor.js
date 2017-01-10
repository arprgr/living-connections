// proeditor.js - Profile Editor component

define([ "jquery", "services", "textinput", "vidrec", "button", "slideform" ],
  function($, Services, TextInput, VideoRecorder, Button, SlideForm) {

  // Service imports.

  var apiService = Services.apiService;

  function standardButton(label, clickFunc) {
    return new Button($("<button>").addClass("standard")).setLabel(label);
  }

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

      var forwardButton = standardButton("Keep Going");
      forwardButton.onClick(function() {
        nameInput.submit();
      });

      nameInput.valid.addChangeListener(function(isValid) {
        forwardButton.enabled = isValid;
      });

      var cancelButton = standardButton("Cancel");
      cancelButton.onClick(function() {
        self.cancel();
      });

      self.container
        .append($("<div>")
          .text("What name would you like to go by in Living Connections?"))
        .append($("<div>")
          .append(nameInput.container))
        .append($("<div>")
          .append(forwardButton.container)
          .append(cancelButton.container))

      self.nameInput = nameInput;
    });

    c.defineFunction("open", function(data) {
      var self = this;
      self.data = data;
      self.nameInput.value = data.name;
      setTimeout(function() {
        self.nameInput.focus();
      }, 100);
    });
  });

  var ProfileSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = standardButton("Done")
      doneButton.onClick(function() {
        doneButton.enabled = false;
        apiService.saveForm("pro", "upd", self.data)
        .then(function() {
          self.exit();
        })
        .catch(function(err) {
          console.log(err);
        });
      });

      var cancelButton = standardButton("Cancel");
      cancelButton.onClick(function() {
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

  return SlideForm.defineClass(function(c) {

    c.defineInitializer(function() {
      this.options.slides = [{
        componentClass: ProfileNameForm
      },{
        componentClass: VideoRecorder
      },{
        componentClass: ProfileSubmitForm
      }]
    });
  })
});
