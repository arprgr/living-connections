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
        .addPlugin(self)
        .addPlugin({
          requestOpen: function() {
            return self.openByIndex(index);
          }
        })
        .setParent(self);
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
        var expand = false;
        if (self.slideIndex < 0 && slide.isLacking) {
          self.slideIndex = i;
          expand = true;
        }
        slide.render(expand);
      }
      return self;
    }

    function SlideForm_close(self) {
      for (var i = 0; i < self.slides.length; ++i) {
        self.slides[i].close();
      }
      return self;
    }

    function SlideForm_openByIndex(self, newIndex) {
      if (newIndex != self.slideIndex) {
        if (self.slideIndex >= 0) {
          self.slides[self.slideIndex].render(false).close();
        }
        self.slideIndex = newIndex;
        self.slides[newIndex].render(true);
      }
      return self;
    }

    function SlideForm_advance(self, incr) {
      if (incr == null) {
        incr = 1;
      }
      return SlideForm_openByIndex(self, self.slideIndex + incr);
    }

    c.defineInitializer(function() {
      SlideForm_init(this);
    });

    c.extendPrototype({
      open: function(data) {
        return SlideForm_open(this, data);
      },
      openByIndex: function(newIndex) {
        return SlideForm_openByIndex(this, newIndex);
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

    c.defineProperty("parent", {
      set: function(parent) {
        this._parent = parent;
      },
      get: function() {
        return this._parent;
      }
    });

    c.defineProperty("data", {
      get: function() {
        return this.parent.data;
      }
    });

    c.extendPrototype({
      render: function(expanded) {
        var self = this;
        self.container.find(".expanded").setVisible(expanded);
        self.container.find(".collapsed").setVisible(!expanded);
        return self;
      },
      close: function() {
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
