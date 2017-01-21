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
      self.container
        .append($("<div>")
          .addClass("expanded")
          .text("Future versions of this app will allow you to assign an active period for the announcement."))
        .append($("<div>")
          .addClass("expanded")
          .append(ui.Button.create("OK", function() {
            self.advance();
          }).container)
        )
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      forms: [ AnnouncementTypeForm, AnnouncementPeriodForm, VideoRecorder ]
    });

    c.extendPrototype({
      _initData: function() {
        return this.actionItem.announcement;
      }
    });
  })
});
