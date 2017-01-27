// inveditor.js - Invitation Editor component

define([ "jquery", "services", "editor", "vidrec",      "ui/index" ],
function($,        Services,   Editor,   VideoRecorder, ui) {

  var Button = ui.Button;

  var apiService = Services.apiService;

  var InvitationEmailCell = Editor.Cell.defineClass(function(c) {

    c.defineDefaultOptions({
      writeOnce: true,
      outputProperties: [ "email" ]
    });

    c.defineInitializer(function() {
      var self = this;

      var emailInput = new ui.EmailInput().addPlugin({
        submit: function(email) {
          self.data.email = email;
          self.advance();
        }
      })

      var okButton = Button.create("OK", function() {
        emailInput.submit();
      });

      emailInput.addChangeListener(function() {
        okButton.enabled = emailInput.valid;
      });

      self.form.container
        .append($("<div>")
          .text("What is your friend's email address?"))
        .append($("<div>")
          .append(emailInput.container)
          .append(okButton.container))

      self.emailInput = emailInput;
    });

    c.extendPrototype({
      openForm: function() {
        var self = this;
        self.emailInput.value = self.data.email;
        setTimeout(function() {
          self.emailInput.focus();
        }, 100);
      },
      summarize: function() {
        var email = this.data.email;
        return email ? ("Email to:" + email) : "(recipient not yet selected)";
      }
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      cells: [ InvitationEmailCell, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.invite;
      }
    });
  });
});
