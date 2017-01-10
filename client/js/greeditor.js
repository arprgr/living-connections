// greeditor.js - Greeting Editor component

define([ "jquery", "services", "vidrec", "button", "slideform" ],
  function($, Services, VideoRecorder, Button, SlideForm) {

  // Service imports.

  var apiService = Services.apiService;

  function standardButton(label, clickFunc) {
    return new Button($("<button>").addClass("standard")).setLabel(label);
  }

  var GreetingSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = standardButton("Done")
      doneButton.onClick(function() {
        self.save();
      });

      var cancelButton = standardButton("Cancel");
      cancelButton.onClick(function() {
        self.cancel();
      });

      self.container
        .append($("<div>")
          .text("Press Done to send your greeting, or Cancel to throw it out."))
        .append($("<div>")
          .append(doneButton.container)
          .append(cancelButton.container)
        );
    });

    c.defineFunction("save", function() {
      var data = self.context.data;
      return apiService.saveForm("gre", data.id ? "upd" : "cre", data);
    });
  });

  return SlideForm.defineClass(function(c) {

    c.defineInitializer(function() {
      this.options.slides = [{
        componentClass: VideoRecorder
      },{
        componentClass: GreetingSubmitForm
      }]
    });
  })
});
