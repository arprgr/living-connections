// anneditor.js - Announcement Editor component

define([ "jquery", "services", "editor", "vidrec",      "ui/index" ],
function($,        Services,   Editor,   VideoRecorder, ui) {

  var AnnouncementTypeForm = Editor.Form.defineClass(function(c) {

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

      self.container.append($("<div>")
        .addClass("expanded")
        .append($("<div>")
          .text("Announce to all users, or only to new users?"))
        .append(radioGroup.container)
        .append($("<div>")
          .append(ui.Button.create("Keep Going", function() {
            self.data.type = radioGroup.value;
            self.advance();
          }).container))
      );

      self.radioGroup = radioGroup;
    });

    c.extendPrototype({
      render: function(expanded) {
        this.radioGroup.apparentValue = this.data && this.data.type;
        return Editor.Form.prototype.render.call(this, expanded);
      },
      _renderSummary: function() {
        var type = this.data && this.data.type;
        if (type == null) {
          return "(Audience not selected)";
        }
        return "Announce to " + (type == 4 ? "new" : "all") + " users";
      }
    });
  });

  var AnnouncementPeriodForm = Editor.Form.defineClass(function(c) {

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
      self.container
        .append($("<div>")
          .addClass("expanded")
          .append($("<span>").text("Start date: "))
          .append(startDatePicker.container))
        .append($("<div>")
          .addClass("expanded")
          .append($("<span>").text("End date: "))
          .append(endDatePicker.container))
        .append($("<div>")
          .addClass("expanded")
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
      render: function(expanded) {
        if (expanded) {
          var startDate = this.data.startDate ? new Date(this.data.startDate) : new Date();
          var endDate = this.data.endDate ? new Date(this.data.endDate) : 
                new Date(startDate.getTime() + 7*24*60*60*1000);
          this.startDatePicker.value = startDate;
          this.endDatePicker.value = endDate;
        }
        return Editor.Form.prototype.render.call(this, expanded);
      },
      _renderSummary: function() {
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
      forms: [ AnnouncementTypeForm, AnnouncementPeriodForm, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.message;
      }
    });
  })
});
