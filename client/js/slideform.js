// slideform.js - A framework component for "one bite at a time" input forms.

define([ "jquery", "component" ], function($, Component) {

  var SlideForm = Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.slideIndex = -1;
    });

    function render(self) {
      if (self.slides == null) {
        self.slides = [];
        var slideDescs = self.options.slides;
        for (var i = 0; i < slideDescs.length; ++i) {
          var slideDesc = slideDescs[i];

          var container = $("<div>");
          if (slideDesc.cssClass) {
            container.addClass(slideDesc.cssClass);
          }
          self.container.append(container);

          self.slides.push(new (slideDesc.componentClass)(container, slideDesc.options)
            .addPlugin(self)
            .setVisible(false));
        }
      }
    }

    function doOpen(self) {
      var slide = self.slides[self.slideIndex];
      slide.open(self.data);
      slide.visible = true;
    }

    c.defineFunction("open", function(data) {
      var self = this;
      render(self);
      self.data = $.extend({}, data || {});
      self.close();
      self.slideIndex = 0;
      doOpen(self);
      return self;
    });

    c.defineFunction("close", function(incr) {
      var self = this;
      if (self.slideIndex >= 0) {
        var slide = self.slides[self.slideIndex];
        slide.visible = false;
        slide.close();
      }
    });

    c.defineFunction("advance", function(incr) {
      var self = this;
      if (incr == null) {
        incr = 1;
      }
      if (incr != 0) {
        self.close();
        self.slideIndex += incr;
        doOpen(self);
      }
    });

    c.defineFunction("exit", function() {
      this.invokePlugin("exit");
    });
  });

  SlideForm.Form = Component.defineClass(function(c) {

    c.defineFunction("open", function(data) { this.data = data; return this; });
    c.defineFunction("close", function() {});
    c.defineFunction("exit", function() {
      this.invokePlugin("exit");
    });
    c.defineFunction("advance", function() {
      this.invokePlugin("advance");
    });
  });

  return SlideForm;
});
