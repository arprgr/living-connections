// anneditor.js - Announcement Editor component

define([ "jquery", "services", "vidrec", "button", "slideform" ],
  function($, Services, VideoRecorder, Button, SlideForm) {

  // Service imports.

  var apiService = Services.apiService;

  var AnnouncementTypeForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var forwardButton = Button.create("Keep Going", function() {
        self.data.type = self.value;
        self.advance();
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .text("You wish to make an announcement to the users."))
        .append($("<div>")
          .text("To all users, or only to new users?"))
        .append($("<div>")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 1))
          .append($("<span>").text("To all users")))
        .append($("<div>")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 2))
          .append($("<span>").text("To new users")))
        .append($("<div>")
          .append(forwardButton.container)
          .append(cancelButton.container))
    });

    c.defineProperty("value", {
      get: function() {
        this.container.find("input:radio[name='annType']:checked").val();
      },
      set: function(value) {
        var self = this;
        var foundIt = false;
        self.container.find("input:radio[name='annType']").each(function(ix, radio) {
          var equal = $(radio).val() == value;
          $(radio).attr("checked", equal);
          if (equal) foundIt = true;
        });
        if (!foundIt) {
          $(self.container.find("input:radio[name='annType']")[0]).attr("checked", true);
        }
      }
    });

    c.defineFunction("open", function(data) {
      this.data = data;
      this.value = data.type;
    });
  });

  var AnnouncementPeriodForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var forwardButton = Button.create("Keep Going", function() {
        self.data.startDate = "2016-12-31";
        self.data.endDate = "2017-03-31";
        self.advance();
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .text("Future versions of this app will allow you to assign an active period for the announcement."))
        .append($("<div>")
          .text("For now, all announcements last until March 2017!"))
        .append($("<div>")
          .append(forwardButton.container)
          .append(cancelButton.container))
    });
  });

  var AnnouncementSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = Button.create("Done", function() {
        self.save();
      });

      var cancelButton = Button.create("Cancel", function() {
        self.exit();
      });

      self.container
        .append($("<div>")
          .text("Press Done to save your announcement, or Cancel to throw it out."))
        .append($("<div>")
          .append(doneButton.container)
          .append(cancelButton.container)
        );
    });

    c.defineFunction("save", function() {
      var data = self.data;
      return apiService.saveForm("ann", data.id ? "upd" : "cre", data);
    });
  });

  return SlideForm.defineClass(function(c) {

    c.defineDefaultOptions({
      slides: [
        AnnouncementTypeForm,
        AnnouncementPeriodForm,
        VideoRecorder,
        AnnouncementSubmitForm
      ]
    });
  })
});
