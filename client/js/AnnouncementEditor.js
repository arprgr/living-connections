// anneditor.js - Announcement Editor component

define([ "jquery", "services", "editor", "vidrec",      "ui/index" ],
function($,        Services,   Editor,   VideoRecorder, ui) {

  var AnnouncementTypeCell = Editor.Cell.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: [ "type" ]
    });

    c.defineInitializer(function() {
      var self = this;

      var radioGroup = new ui.RadioGroup($("<div>"), {
        groupName: "annType",
        choices: [
          { value: 3, label: "To all users" },
          { value: 4, label: "To new users" }
        ]
      });

      self.form.container
        .append($("<div>")
          .text("Announce to all users, or only to new users?"))
        .append(radioGroup.container)
        .append($("<div>")
          .append(ui.Button.create("Keep Going", function() {
            self.data.type = radioGroup.value;
            self.advance();
          }).container)
        );

      self.radioGroup = radioGroup;
    });

    c.extendPrototype({
      open: function() {
        this.radioGroup.apparentValue = this.data && this.data.type;
        return Editor.Cell.prototype.open.call(this);
      },
      summarize: function() {
        var type = this.data && this.data.type;
        if (type == null) {
          return "(Audience not selected)";
        }
        return "Announce to " + (type == 4 ? "new" : "all") + " users";
      }
    });
  });

  var AnnouncementPeriodCell = Editor.Cell.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var startDatePicker = new ui.DateTimeInput($("<span>"));
      startDatePicker.addChangeListener(function(value) {
        self.data.startDate = value;
      });
      var endDatePicker = new ui.DateTimeInput($("<span>"));
      endDatePicker.addChangeListener(function(value) {
        self.data.endDate = value;
      });
      self.form.container
        .append($("<div>")
          .append($("<span>").text("Start date: "))
          .append(startDatePicker.container))
        .append($("<div>")
          .append($("<span>").text("End date: "))
          .append(endDatePicker.container))
        .append($("<div>")
          .append(ui.Button.create("OK", function() {
            self.data.startDate = startDatePicker.value;
            self.data.endDate = endDatePicker.value;
            self.advance();
          }).container)
        )
      self.startDatePicker = startDatePicker;
      self.endDatePicker = endDatePicker;
    });

    c.extendPrototype({
      open: function() {
        var startDate = this.data.startDate ? new Date(this.data.startDate) : new Date();
        var endDate = this.data.endDate ? new Date(this.data.endDate) : 
          new Date(startDate.getTime() + 7*24*60*60*1000);
        this.startDatePicker.value = startDate;
        this.endDatePicker.value = endDate;
        return Editor.Cell.prototype.open.call(this);
      },
      summarize: function() {
        var startDate = this.data.startDate;
        var endDate = this.data.endDate;
        if (!startDate || !endDate) {
          return "(Active period not selected)";
        }
        return "Announcement active from " + startDate  + " to " + endDate;
      }
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      cells: [ AnnouncementTypeCell, AnnouncementPeriodCell, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.message;
      }
    });
  })
});
