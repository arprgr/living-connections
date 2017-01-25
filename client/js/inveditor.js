// inveditor.js - Invitation Editor component

define([ "jquery", "services", "editor", "vidrec",      "ui/index" ],
function($,        Services,   Editor,   VideoRecorder, ui) {

  var Button = ui.Button;

  var apiService = Services.apiService;

  var InvitationEmailForm = Editor.Form.defineClass(function(c) {

    c.defineDefaultOptions({
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

      self.container
        .append($("<div>")
          .addClass("expanded")
          .text("What is your friend's email address?"))
        .append($("<div>")
          .addClass("expanded")
          .append(emailInput.container)
          .append(okButton.container))

      self.emailInput = emailInput;
    });

    c.extendPrototype({
      render: function(expanded) {
        var self = this;
        Editor.Form.prototype.render.call(self, expanded);
        if (expanded) {
          self.emailInput.value = self.data.email;
          setTimeout(function() {
            self.emailInput.focus();
          }, 100);
        }
        return self;
      },
      _renderSummary: function() {
        return "Email to:" + this.data.email;
      }
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      forms: [ InvitationEmailForm, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.invite;
      }
    });
  });
});
