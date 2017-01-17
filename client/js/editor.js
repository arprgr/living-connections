// editor.js - Editor = an Activity that creates/modifies an entity.

define([ "jquery", "services", "activityui", "slideform", "ui/index" ],
function($, Services, Activity, SlideForm, ui) {

  var Form = SlideForm.Form.defineClass(function(c) {

    function Form_init(self) {
      self.container
        .append($("<div>")
          .addClass("summary")
          .addClass("collapsed")
          .append(ui.Link.create("Change", function() {
            self.requestOpen();
          })))
    }

    c.defineInitializer(function() {
      Form_init(this);
    });

    function Form_isLacking(self) {
      if (!self.data) return true;
      for (var i = 0; i < self.options.outputProperties.length; ++i) {
        if (self.options.outputProperties[i] == null) {
          return true;
        }
      }
      return false;
    }

    c.defineProperty("isLacking", {
      get: function() {
        return Form_isLacking(this);
      }
    });

    function Form_render(self, expanded) {
      self.container.find(".summary").text(self._renderSummary());
      return SlideForm.Form.prototype.render.call(self, expanded);
    }

    c.extendPrototype({
      render: function(expanded) {
        return Form_render(this, expanded);
      }
    });
  });

  var Submit = SlideForm.Form.defineClass(function(c) {

    function init(self) {
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
    }

    c.defineInitializer(function() {
      init(this);
    });
  });

  var Editor = Activity.defineClass(function(c) {

    c.defineDefaultOptions({
      inputProperty: "message",
      forms: [],
      submit: Submit
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
        self.form.open(actionItem[self.options.inputProperty]);
        return self;
      }
    });
  });

  Editor.Form = Form;
  Editor.Submit = Submit;

  return Editor;
});
