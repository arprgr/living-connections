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
        var slideClasses = self.options.slides;
        for (var i = 0; i < slideClasses.length; ++i) {
          var SlideClass = slideClasses[i];
          var slide = new SlideClass()
            .addPlugin(self)
            .setVisible(false);
          self.slides.push(slide);
          self.container.append(slide.container);
        }
      }
    }

    function doOpen(self) {
      var slide = self.slides[self.slideIndex];
      slide.open(self.data);
      slide.visible = true;
    }

    c.extendPrototype({
      open: function(data) {
        var self = this;
        render(self);
        self.data = $.extend({}, data || {});
        self.close();
        self.slideIndex = 0;
        doOpen(self);
        return self;
      },

      close: function(incr) {
        var self = this;
        if (self.slideIndex >= 0) {
          var slide = self.slides[self.slideIndex];
          slide.visible = false;
          slide.close();
        }
      },

      advance: function(incr) {
        var self = this;
        if (incr == null) {
          incr = 1;
        }
        if (incr != 0) {
          self.close();
          self.slideIndex += incr;
          doOpen(self);
        }
      },

      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });

  SlideForm.Form = Component.defineClass(function(c) {

    c.extendPrototype({
      open: function(data) {
        this.data = data;
        return this;
      },
      close: function() {},
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
