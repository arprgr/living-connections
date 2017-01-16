// anneditor.js - Announcement Editor component

define([ "jquery", "services", "activityui", "vidrec", "button", "slideform" ],
  function($, Services, Activity, VideoRecorder, Button, SlideForm) {

  // Service imports.

  var apiService = Services.apiService;

  var AnnouncementTypeForm = SlideForm.Form.defineClass(function(c) {

    function AnnouncementTypeForm_init(self) {

      var forwardButton = Button.create("Keep Going", function() {
        self.data.type = self.value;
        self.advance();
      });

      var stateLabel = $("<div>")
        .addClass("formsect")
        .addClass("collapsed");

      function updateValue() {
        self.data.type = self.container.find("input:radio[name='annType']:checked").val();
      }

      self.container
        .addClass("formpanel")
        .addClass("odd")
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .text("Announce to all users, or only to new users?"))
        .append(stateLabel)
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 1).on("change", updateValue))
          .append($("<span>").text("To all users")))
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 2).on("change", updateValue))
          .append($("<span>").text("To new users")))
        .append($("<div>")
          .addClass("expanded")
          .addClass("formsect")
          .append(forwardButton.container))

      self.stateLabel = stateLabel;
    }

    function AnnouncementTypeForm_renderRadios(self) {

      function selectRadios() {
        return $(self.container.find("input:radio[name='annType']"));
      }

      var value = self.data.type;
      var indexToCheck = 0;
      if (value != null) {
        selectRadios().each(function(ix, radio) {
          var equal = $(radio).val() == value;
          if (equal) {
            indexToCheck = ix;
          }
          else {
            $(radio).attr("checked", equal);
          }
        });
      }
      $(selectRadios()[indexToCheck]).attr("checked", true);
    }

    function AnnouncementTypeForm_renderLabel(self) {
      self.stateLabel.text("Announcement " + (self.data.type == 0 ? "to all users" : "to new users"));
    }

    function AnnouncementTypeForm_render(self, expanded) {
      SlideForm.Form.prototype.render.call(self, expanded);
      AnnouncementTypeForm_renderRadios(self);
      AnnouncementTypeForm_renderLabel(self);
      return self;
    }

    c.defineInitializer(function() {
      AnnouncementTypeForm_init(this);
    });

    c.extendPrototype({
      render: function(expanded) {
        return AnnouncementTypeForm_render(this, expanded);
      }
    });
  });

  var AnnouncementPeriodForm = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var stateLabel = $("<div>")
        .addClass("formsect")
        .addClass("collapsed");

      var forwardButton = Button.create("OK", function() {
        self.data.startDate = "2016-12-31";
        self.data.endDate = "2017-03-31";
        self.advance();
      });

      self.container
        .addClass("formpanel")
        .append(stateLabel)
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .text("Future versions of this app will allow you to assign an active period for the announcement."))
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .text("For now, all announcements last until March 2017!"))
        .append($("<div>")
          .addClass("formsect")
          .addClass("expanded")
          .append(forwardButton.container))

      self.stateLabel = stateLabel;
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
        .addClass("formpanel")
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
      var form = new SlideForm(self.container.find(".form"), {
        slides: [
          { cons: AnnouncementTypeForm, cssClass: "odd" },
          AnnouncementPeriodForm,
          { cons: VideoRecorder, cssClass: "odd" },
          AnnouncementSubmitForm
        ]
      })
      form.addPlugin(self);
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
