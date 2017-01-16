// greeditor.js - Greeting Editor component

define([ "jquery", "services", "activityui", "vidrec", "button", "slideform" ],
  function($, Services, Activity, VideoRecorder, Button, SlideForm) {

  var apiService = Services.apiService;

  var GreetingSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = Button.create("Done", function() {
        apiService.saveForm("gre", "cre", self.data)
        .then(function() {
          self.exit();
        });
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .addClass("formsect")
          .text("Press Done to send your message, or Cancel to throw it out."))
        .append($("<div>")
          .addClass("formsect")
          .append(doneButton.container)
          .append(cancelButton.container)
        );
    });
  });

  return Activity.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.form = new SlideForm(self.container.find(".form"), {
        slides: [
          VideoRecorder,
          GreetingSubmitForm
        ]
      }).addPlugin(self);
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        Activity.prototype.open.call(self, actionItem);
        self.form.open({ toUserId: actionItem.user.id });
      }
    });
  });
});
