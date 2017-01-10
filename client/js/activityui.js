// activityui.js - ActivityComponent

define([ "jquery", "component", "annviewer", "inveditor" ], function($, Component, AnnouncementViewer, InvitationEditor) {

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
      self.close();
      var parts = actionItem.type.split("-");
      var what = parts[0];
      var action = parts[1];
      updateHeader(self, actionItem);
      var form;
      switch (what) {
      case "ann":
        form = new (action == "rec" ? AnnouncementViewer : AnnouncementEditor)().open(actionItem);
        break;
      case "gre":
        form = new (action == "rec" ? GreetingViewer : GreetingEditor)().open(actionItem);
        break;
      case "inv":
        form = new (action == "rec" ? InvitationViewer : InvitationEditor)().open(actionItem);
        break;
      case "pro":
        form = new (action == "rec" ? ProfileViewer : ProfileEditor)().open(actionItem);
        break;
      }
      self.container.find(".form").empty().append(form.container);
      form.onCancel = function() {
        self.onActivityClose && self.onActivityClose();
      }
      form.openActionItem = function(actionItem) {
        self.open(actionItem);
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
