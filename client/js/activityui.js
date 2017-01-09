// activityui.js - ActivityComponent

define([ "jquery", "component", "inveditor" ], function($, Component, InvitationEditor) {

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container 
        .append($("<img>").addClass("lilIcon"))
        .append($("<span>").addClass("title"))
        .append($("<div>").addClass("form"))
    });

    function updateHeader(self, actionItem) {
      self.container.find(".lilIcon").attr("src", actionItem && actionItem.iconUri || "");
      self.container.find(".title").text(actionItem && actionItem.title || "");
    }

    c.defineFunction("open", function(actionItem) {
      var self = this;
      var parts = actionItem.type.split("-");
      var what = parts[0];
      var action = parts[1];
      updateHeader(self, actionItem);
      var FormClass;
      switch (what) {
      case "inv":
        FormClass = InvitationEditor;
      }
      var form = new FormClass();
      self.container.find(".form").empty().append(form.container);
      form.open(actionItem);
      form.onCancel = function() {
        self.onActivityClose && self.onActivityClose();
      }
      return self;
    });

    c.defineFunction("close", function() {
      var self = this;
      if (self.form) {
        self.form.close();
        self.form.container.remove();
        self.form = null;
      }
      updateHeader(self);
      return self;
    });
  });
});
