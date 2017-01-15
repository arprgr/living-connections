// anneditor.js - Announcement Editor component

define([ "jquery", "services", "activityui", "vidrec", "button", "slideform" ],
  function($, Services, Activity, VideoRecorder, Button, SlideForm) {

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
          .addClass("formsect")
          .text("Announce to all users, or only to new users?"))
        .append($("<div>")
          .addClass("formsect")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 1))
          .append($("<span>").text("To all users")))
        .append($("<div>")
          .addClass("formsect")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 2))
          .append($("<span>").text("To new users")))
        .append($("<div>")
          .addClass("formsect")
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

    c.extendPrototype({
      open: function(data) {
        this.data = data;
        this.value = data.type;
      }
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
          .addClass("formsect")
          .text("Future versions of this app will allow you to assign an active period for the announcement."))
        .append($("<div>")
          .addClass("formsect")
          .text("For now, all announcements last until March 2017!"))
        .append($("<div>")
          .addClass("formsect")
          .append(forwardButton.container)
          .append(cancelButton.container))
    });
  });

  var AnnouncementSubmitForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var doneButton = Button.create("Done", function() {
        var data = self.data;
        apiService.saveForm("ann", data.id ? "upd" : "cre", data)
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
          .text("Press Done to save your announcement, or Cancel to throw it out."))
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
      var form = new SlideForm($("<div>").addClass("form"), {
        slides: [
          AnnouncementTypeForm,
          AnnouncementPeriodForm,
          VideoRecorder,
          AnnouncementSubmitForm
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
        self.form.open(actionItem.announcement);
      }
    });
  })
});
