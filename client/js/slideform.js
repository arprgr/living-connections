// slideform.js - A framework component for "one bite at a time" input forms.

define([ "jquery", "ui/component" ], function($, Component) {

  var SlideForm = Component.defineClass(function(c) {

    function SlideForm_makeSlide(self, slideDesc, index) {
      if (typeof slideDesc == "function") {
        slideDesc = {
          cons: slideDesc
        };
      }
      var SlideClass = slideDesc.cons;
      var ele = $("<div>");
      if (slideDesc.cssClass) {
        ele.addClass(slideDesc.cssClass);
      }
      return new SlideClass(ele)
        .addPlugin($.extend({}, self, {
          requestOpen: function() {
            return self.requestOpen(index);
          }
        }))
        .setVisible(false);
    }

    function SlideForm_init(self) {
      var slideClasses = self.options.slides;
      var slides = [];
      for (var i = 0; i < slideClasses.length; ++i) {
        var slide = SlideForm_makeSlide(self, slideClasses[i], i);
        slides.push(slide);
        self.container.append(slide.container);
      }
      self.slides = slides;
      self.slideIndex = -1;
    }

    function SlideForm_open(self, data) {
      self.data = data = $.extend({}, data || {});
      self.slideIndex = -1;
      for (var i = 0; i < self.slides.length; ++i) {
        var slide = self.slides[i];
        slide.data = data;
        var expand = false;
        if (self.slideIndex < 0 && slide.isLacking) {
          self.slideIndex = i;
          expand = true;
        }
        slide.render(expand);
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
      return SlideForm_requestOpen(self.slideIndex + incr);
    }

    function SlideForm_requestOpen(self, newIndex) {
      if (newIndex != self.slideIndex) {
        if (self.slideIndex >= 0) {
          self.slides[self.slideIndex].render(false);
        }
        self.slideIndex = newIndex;
        self.slides[newIndex].render(true);
      }
      return self;
    }

    c.defineInitializer(function() {
      SlideForm_init(this);
    });

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

    function SlideFormForm_render(self, expanded) {
      if (expanded) {
        self.container.find(".expanded").show();
        self.container.find(".collapsed").hide();
      }
      else {
        self.container.find(".expanded").hide();
        self.container.find(".collapsed").show();
      }
      return self;
    }

    c.extendPrototype({
      render: function(expanded) {
        return SlideFormForm_render(this, expanded);
      },
      exit: function() {
        this.invokePlugin("exit");
      },
      requestOpen: function() {
        this.invokePlugin("requestOpen");
      },
      advance: function() {
        this.invokePlugin("advance");
      }
    });
  });

  return SlideForm;
});
