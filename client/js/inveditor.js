// inveditor.js - Invitation Editor component

define([ "jquery", "services", "vidrec", "button", "slideform", "emailinput" ],
  function($, Services, VideoRecorder, Button, SlideForm, EmailInput) {

  // Service imports.

  var apiService = Services.apiService;

  function standardButton(label, clickFunc) {
    return new Button($("<button>").addClass("standard")).setLabel(label);
  }

  var InvitationEmailForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var emailInput = new EmailInput($("<div>"));
      emailInput.addPlugin({
        submit: function(email) {
          self.data.email = email;
          self.advance();
        }
      })

      var forwardButton = standardButton("Keep Going");
      forwardButton.onClick(function() {
        emailInput.submit();
      });

      emailInput.valid.addChangeListener(function(isValid) {
        forwardButton.enabled = isValid;
      });

      var cancelButton = standardButton("Cancel");
      cancelButton.onClick(function() {
        self.cancel();
      });

      self.container
        .append($("<div>")
          .text("What is your friend's email address?"))
        .append($("<div>")
          .text("Sorry, in this version of the site you must know your friend's email address. " + 
            "(Future versions will allow other means of identification.)"))
        .append($("<div>")
          .append(emailInput.container))
        .append($("<div>")
          .append(forwardButton.container)
          .append(cancelButton.container))

      self.emailInput = emailInput;
    });

    c.defineFunction("open", function(data) {
      var self = this;
      self.data = data;
      self.emailInput.value = data.email;
      setTimeout(function() {
        self.emailInput.focus();
      }, 100);
    });
  });

  var InvitationSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = standardButton("Done")
      doneButton.onClick(function() {
        var data = self.data;
        apiService.saveForm("inv", data.id ? "upd" : "cre", data)
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
          .text("Press Done to send your invitation, or Cancel to throw it out."))
        .append($("<div>")
          .append(doneButton.container)
          .append(cancelButton.container))
    });
  });

  return SlideForm.defineClass(function(c) {

    c.defineDefaultOptions({
      slides: [{
        componentClass: InvitationEmailForm
      },{
        componentClass: VideoRecorder
      },{
        componentClass: InvitationSubmitForm
      }]
    });
  })
});
