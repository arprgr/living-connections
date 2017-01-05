// anneditor.js - Announcement Editor component

define([ "jquery", "component", "services", "obs", "vidrec", "button" ],
  function($, Component, Services, Observable, VideoRecorder, Button) {

  // Service imports.

  var apiService = Services.apiService;

  function standardButton(label, clickFunc) {
    return new Button($("<button>").addClass("standard")).setLabel(label).setVisible(false);
  }

  function updateButtons(self) {
    var first = self.slideIndex == 0;
    var last = self.slideIndex == self.slides.length - 1;
    self.restartButton.visible = false;    // Not sure whether to keep this button.
    self.restartButton.enabled = !first;
    self.forwardButton.visible = !last;
    self.doneButton.visible = last;
    self.cancelButton.visible = true;
  }

  function restart(self) {
    if (self.slideIndex > 0) {
      var slide = self.slides[self.slideIndex];
      slide.dom.hide();
      self.slideIndex = 0;
      slide = self.slides[0];
      slide.open(self);
      slide.dom.show();
      updateButtons(self);
    }
  }

  function nextSlide(self) {
    var slide;
    for (;;) {
      self.slideIndex += 1;
      slide = self.slides[self.slideIndex];
      if (!slide.isComplete(self)) {
        break;
      }
    }
    if (!slide.dom) {
      self.body.append(slide.dom = slide.render(self));
    }
    slide.open(self);
    slide.dom.show();
    updateButtons(self);
  }

  function forward(self) {
    var slide = self.slides[self.slideIndex];
    if (slide.validate(self)) {
      slide.dom.hide();
      nextSlide(self);
    }
  }

  function cancel(self) {
    self.container.empty();
  }

  function save(self) {
    return apiService.saveForm("ann", self.announcement ? "upd" : "cre", self.form);
  }

  function makeSlides() {
    return [{
      // Slide 1: select recipients.
      open: function(editor) {
        var foundIt = false;
        this.dom.find("input:radio[name='annType']").each(function(ix, radio) {
          var equal = $(radio).val() == editor.form.type;
          $(radio).attr("checked", equal);
          if (equal) foundIt = true;
        });
        if (!foundIt) {
          $(this.dom.find("input:radio[name='annType']")[0]).attr("checked", true);
        }
      },
      validate: function(editor) {
        editor.form.type = this.dom.find("input:radio[name='annType']:checked").val();
        return true;
      },
      isComplete: function(editor) {
        return editor.form.type != null;
      },
      render: function() {
        return $("<div>")
          .addClass("slideFormCell")
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
      }
    }, {
      // Slide 2: select active period.
      open: function() {
      },
      validate: function(editor) {
        editor.slide2Seen = 1;
        return true;
      },
      isComplete: function(editor) {
        return !!editor.slide2Seen;
      },
      render: function() {
        return $("<div>")
          .addClass("slideFormCell")
          .append($("<div>")
            .text("Future versions of this app will allow you to assign an active period for the announcement."))
          .append($("<div>")
            .text("For now, all announcements last until March 2017!"))
      }
    }, {
      // Slide 3: record video.
      open: function(editor) {
        if (editor.announcement) {
          editor.videoRecorder.openAsset(editor.announcement.asset);
        }
        else {
          editor.videoRecorder.openCamera();
        }
      },
      validate: function(editor) {
        return editor.form.assetId != null;
      },
      isComplete: function(editor) {
        return editor.form.assetId != null;
      },
      render: function(editor) {
        return $("<div>")
          .addClass("slideFormCell")
          .append(editor.videoRecorder.container);
      }
    }, {
      // Slide 4: review and submit.
      open: function() {
      },
      validate: function() {
        return true;
      },
      isComplete: function() {
        return false;
      },
      render: function() {
        return $("<div>")
          .addClass("slideFormCell")
          .append($("<div>")
            .text("Press Done to save your announcement."))
      }
    }]
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;

      var body = $("<div>");
      var forwardButton = standardButton("Keep Going");
      forwardButton.onClick(function() {
        forward(self);
      });
      var restartButton = standardButton("Start Over");
      restartButton.onClick(function() {
        restart(self);
      });
      var cancelButton = standardButton("Cancel");
      cancelButton.onClick(function() {
        cancel(self);
      });
      var doneButton = standardButton("Done");
      doneButton.onClick(function() {
        save(self);
      });

      self.container
        .append(body)
        .append($("<div>")
          .append(forwardButton.container)
          .append(restartButton.container)
          .append(doneButton.container)
          .append(cancelButton.container));

      var videoRecorder = new VideoRecorder($("<div>").addClass("vid"));
      videoRecorder.asset.addChangeListener(function(asset) {
        if (asset) {
          self.form.assetId = asset.id;
        }
        else {
          delete self.form.assetId;
        }
      });

      self.body = body;
      self.forwardButton = forwardButton;
      self.restartButton = restartButton;
      self.cancelButton = cancelButton;
      self.doneButton = doneButton;
      self.videoRecorder = videoRecorder;
      self.slides = makeSlides();
    });

    c.defineFunction("open", function(announcement) {
      var self = this;
      if (announcement) {
        self.form = announcement;
      }
      else {
        self.form = {
          startDate: "2016-12-31",
          endDate: "2017-03-31"
        };
      }
      self.slideIndex = -1;
      nextSlide(self);
      return self;
    });

    c.defineFunction("close", function() {
      this.videoRecorder.close();
      return this;
    });
  });
});
