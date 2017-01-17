// editor.js - Editor = an Activity that creates/modifies an entity.

define([ "jquery", "services", "activityui", "slideform", "ui/index" ],
function($,        Services,   Activity,     SlideForm,   ui) {

  var Form = SlideForm.Form.defineClass(function(c) {

    c.defineDefaultOptions({
      outputProperties: []
    });

    c.defineInitializer(function() {
      var self = this;
      self.container
        .addClass("panel")
        .append($("<div>")
          .addClass("collapsed")
          .append($("<span>").addClass("summary"))
          .append($("<span>").text(" "))
          .append(ui.Link.create("Change", function() {
            self.requestOpen();
          }).container))
    });

    c.defineProperty("actionItem", {
      get: function() {
        return this.parent.actionItem;
      }
    });

    c.defineProperty("isLacking", {
      get: function() {
        var self = this;
        if (!self.data) return true;
        var outputProperties = self.options.outputProperties;
        for (var i = 0; i < outputProperties.length; ++i) {
          if (self.data[outputProperties[i]] == null) {
            return true;
          }
        }
        return false;
      }
    });

    c.extendPrototype({
      render: function(expanded) {
        var self = this;
        self.container.find(".summary").text(self._renderSummary());
        return SlideForm.Form.prototype.render.call(self, expanded);
      },
      _renderSummary: function() {
        return "";
      }
    });
  });

  var Submit = SlideForm.Form.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container
        .addClass("panel")
        .append(ui.Button.create("Done", function() {
          Services.apiService.saveForm(self.actionItem.what, self.actionItem.action, self.data).then(function() {
            self.exit();
          }).catch(function(err) {
            console.log(err);
          });
        }).container)
        .append(ui.Button.create("Cancel", function() {
          self.exit();
        }).container)
    });

    c.defineProperty("actionItem", {
      get: function() {
        return this.parent.actionItem;
      }
    });
  });

  var Editor = Activity.defineClass(function(c) {

    c.defineDefaultOptions({
      forms: [],
      submit: Submit,
      exitLinkText: "Cancel"
    });

    function getSlides(self) {
      var slides = self.options.forms.slice(0);
      slides.push(self.options.submit);
      return slides;
    }

    c.defineInitializer(function() {
      var self = this;
      self.form = new SlideForm(self.container.find(".body"), {
        slides: getSlides(self)
      }).addPlugin(self);
    });

    c.extendPrototype({
      open: function(actionItem) {
        var self = this;
        Activity.prototype.open.call(self, actionItem);
        self.form.actionItem = actionItem;
        self.form.open(self._initData());
        return self;
      },
      close: function() {
        var self = this;
        self.form.close();
        return self;
      },
      _initData: function() {
      }
    });
  });

  Editor.Form = Form;
  Editor.Submit = Submit;

  return Editor;
});
