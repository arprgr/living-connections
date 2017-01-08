// activityui.js - ActivityComponent

define([ "jquery", "button" ], function($, Button) {

  function ActivityComponent(container) {
    var self = this;

    var iconBox = $("<div>").addClass("lilIcon");
    var exitButtonBox = $("<div>");

    self.container = container;
    container
      .append($("<img>")
        .addClass("lilIcon")
        .attr("src", options.iconUri))
      .append($("<a>")
        .addClass("exit")
        .text("Exit")
        .attr("href", "#")
        .click(function() { close(self); }))
      .append($("<div>").addClass("form"))
    self.element = element;
    self._visible = true;
    if (container) {
      container.append(element);
    }
  }

  function ActivityComponent_open(self, activity) {
    var parts = activity.type.split("-");
    self.what = parts[0];
    self.action = parts[1];
    self.sender = activity.sender;
  }

  ActivityComponent.prototype = {
    setVisible: function(visible) {
      this.container.setVisible(visible);
      return this;
    },
    close: function() {
      this.container.hide().empty();
      this.fireCloseEvent({});
      return this;
    }
  }

  function ActivityComponent_setVisible(self, visible) {
    visible = !!visible;
    if (self._visible != visible) {
      self._visible = visible;
      visible ? self.element.show() : self.element.hide();
    }
  }

  function ActivityComponent_onClick(self, func) {
    self.clickFunc = func;
    return self;
  }

  function ActivityComponent_click(self) {
    if (self.enabled && self.clickFunc) {
      self.clickFunc();
    }
  }

  ActivityComponent.prototype = (function(buttonProto, defineProperty) {

    defineProperty(buttonProto, "visible", {
      get: function() {
        return this._visible;
      },
      set: function(visible) {
        ActivityComponent_setVisible(this, visible);
      }
    });

    return buttonProto;
  })({

    onClick: function(func) {
      return ActivityComponent_onClick(this, func);
    },
    _click: function(func) {
      return ActivityComponent_click(this);
    }

  }, Object.defineProperty);

  return ActivityComponent;
});
