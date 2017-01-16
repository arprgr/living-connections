// inveditor.js - Invitation Editor component

define([ "jquery", "services", "activityui", "vidrec", "slideform", "ui/index" ],
  function($, Services, Activity, VideoRecorder, SlideForm, ui) {

  var Button = ui.Button;
  var EmailInput = ui.EmailInput;

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

    c.extendPrototype({
      open: function(data) {
        var self = this;
        self.data = data;
        self.emailInput.value = data.email;
        setTimeout(function() {
          self.emailInput.focus();
        }, 100);
      }
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
      self.form = new SlideForm(self.container.find(".form"), {
        slides: [
          InvitationEmailForm,
          VideoRecorder,
          InvitationSubmitForm
        ]
      }).addPlugin(self);
      self.data = {};
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        Activity.prototype.open.call(self, actionItem);
        self.data.id = actionItem.invite && actionItem.invite.id;
        self.form.open(self.data);
      }
    });
  });
});
