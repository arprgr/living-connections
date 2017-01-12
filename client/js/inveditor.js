// inveditor.js - Invitation Editor component

define([ "jquery", "services", "activityui", "vidrec", "button", "slideform", "emailinput" ],
  function($, Services, Activity, VideoRecorder, Button, SlideForm, EmailInput) {

  var apiService = Services.apiService;

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

      var forwardButton = Button.create("Keep Going", function() {
        emailInput.submit();
      });

      emailInput.valid.addChangeListener(function(isValid) {
        forwardButton.enabled = isValid;
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .addClass("formsect")
          .text("What is your friend's email address?"))
        .append($("<div>")
          .addClass("formsect")
          .text("Sorry, in this version of the site you must know your friend's email address. " + 
            "(Future versions will allow other means of identification.)"))
        .append($("<div>")
          .addClass("formsect")
          .append(emailInput.container))
        .append($("<div>")
          .addClass("formsect")
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

      var doneButton = Button.create("Done", function() {
        var data = self.data;
        apiService.saveForm("inv", data.id ? "upd" : "cre", data)
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
          .addClass("formsect")
          .text("Press Done to send your invitation, or Cancel to throw it out."))
        .append($("<div>")
          .addClass("formsect")
          .append(doneButton.container)
          .append(cancelButton.container))
    });
  });

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var form = new SlideForm($("<div>").addClass("form"), {
        slides: [
          InvitationEmailForm,
          VideoRecorder,
          InvitationSubmitForm
        ]
      })
      form.addPlugin(self);
      self.container.append(form.container);
      self.form = form;
      self.data = {};
    });

    c.defineFunction("open", function(actionItem) {
      var self = this;
      Activity.prototype.open.call(self, actionItem);
      self.data.id = actionItem.invite && actionItem.invite.id;
      self.form.open(self.data);
    });
  });
});
