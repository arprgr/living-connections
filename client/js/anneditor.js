// anneditor.js - Announcement Editor component

define([ "jquery", "services", "editor", "vidrec", "ui/button", "slideform" ],
  function($, Services, Editor, VideoRecorder, Button, SlideForm) {

  var AnnouncementTypeForm = Editor.Form.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: [ "type" ]
    });

    function AnnouncementTypeForm_init(self) {

      var forwardButton = Button.create("Keep Going", function() {
        self.data.type = self.value;
        self.advance();
      });

      function updateValue() {
        self.data.type = self.container.find("input:radio[name='annType']:checked").val();
      }

      self.container
        .append($("<div>")
          .addClass("expanded")
          .text("Announce to all users, or only to new users?"))
        .append($("<div>")
          .addClass("expanded")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 1).on("change", updateValue))
          .append($("<span>").text("To all users")))
        .append($("<div>")
          .addClass("expanded")
          .append($("<input>").attr("type", "radio").attr("name", "annType").attr("value", 2).on("change", updateValue))
          .append($("<span>").text("To new users")))
        .append($("<div>")
          .addClass("expanded")
          .append(forwardButton.container))
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

    function AnnouncementTypeForm_renderSummary(self) {
      return "Announce to " + (self.data.type === 0 ? "all" : "new") + " users";
    }

    function AnnouncementTypeForm_render(self, expanded) {
      Editor.Form.prototype.render.call(self, expanded);
      AnnouncementTypeForm_renderRadios(self);
      return self;
    }

    c.defineInitializer(function() {
      AnnouncementTypeForm_init(this);
    });

    c.extendPrototype({
      render: function(expanded) {
        return AnnouncementTypeForm_render(this, expanded);
      },
      _renderSummary: function() {
        return AnnouncementTypeForm_renderSummary(this);
      }
    });
  });

  var AnnouncementPeriodForm = SlideForm.Form.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: [ "startDate", "endDate" ]
    });

    c.defineInitializer(function() {
      var self = this;
      self.container
        .append($("<div>")
          .addClass("expanded")
          .text("Future versions of this app will allow you to assign an active period for the announcement."))
        .append($("<div>")
          .addClass("expanded")
          .text("For now, all announcements last until March 2017!"))
        .append($("<div>")
          .addClass("expanded")
          .append(Button.create("OK", function() {
            self.data.startDate = "2016-12-31";
            self.data.endDate = "2017-03-31";
            self.advance();
          }).container)
        )
    });
  });

  return Editor.defineClass(function(c) {

    c.defineDefaultOptions({
      forms: [ AnnouncementTypeForm, AnnouncementPeriodForm, VideoRecorder ]
    });
  })
});
