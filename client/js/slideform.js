// slideform.js - A framework component for "one bite at a time" input forms.

define([ "jquery", "component" ], function($, Component) {

  var SlideForm = Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var slideClasses = self.options.slides;
      var slides = [];
      for (var i = 0; i < slideClasses.length; ++i) {
        var SlideClass = slideClasses[i];
        var slide = new SlideClass()
          .addPlugin(self)
          .setVisible(false);
        slides.push(slide);
        self.container.append(slide.container);
      }
      self.slides = slides;
      self.slideIndex = -1;
    });

    function SlideForm_open(self, data) {
      self.data = $.extend({}, data || {});
      var isNew = true;  // until...
      self.slideIndex = isNew ? 0 : -1;
      for (var i = 0; i < self.slides.length; ++i) {
        var slide = self.slides[i];
        slide.data = data;
        slide.render(i == self.slideIndex);
        slide.visible = true;
      }
      return self;
    }

    function SlideForm_close(self) {
      for (var i = 0; i < self.slides.length; ++i) {
        var slide = self.slides[i];
        slide.visible = false;
      }
      return self;
    }

    function SlideForm_advance(self, incr) {
      if (incr == null) {
        incr = 1;
      }
      if (incr != 0) {
        if (self.slideIndex >= 0) {
          self.slides[self.slideIndex].render(false);
        }
        self.slideIndex += incr;
        self.slides[self.slideIndex].render(true);
      }
      return self;
    }

    c.extendPrototype({
      open: function(data) {
        return SlideForm_open(this, data);
      },
      close: function() {
        return SlideForm_close(this);
      },
      advance: function(incr) {
        return SlideForm_advance(this, incr);
      },
      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });

  SlideForm.Form = Component.defineClass(function(c) {

    c.extendPrototype({
      render: function(expanded) {
        return this;
      },
      exit: function() {
        this.invokePlugin("exit");
      },
      advance: function() {
        this.invokePlugin("advance");
      }
    });
  });

  return SlideForm;
});
