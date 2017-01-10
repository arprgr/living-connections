// activityui.js - ActivityComponent

define([ "jquery", "component", "annviewer", "inveditor", "proeditor", "crossfade" ],
  function($, Component, AnnouncementViewer, InvitationEditor, ProfileEditor, CrossFade) {

  function ComponentClassFor(actionItem) {
    var parts = actionItem.type.split("-");
    var what = parts[0];
    var action = parts[1];
    switch (what) {
    case "ann":
      return action == "rec" ? AnnouncementViewer : AnnouncementEditor;
    case "gre":
      return action == "rec" ? GreetingViewer : GreetingEditor;
    case "inv":
      return action == "rec" ? InvitationViewer : InvitationEditor;
    case "pro":
      return action == "rec" ? ProfileViewer : ProfileEditor;
    }
  }

  return Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      self.container 
        .append($("<div>")
          .append($("<img>").addClass("lilIcon"))
          .append($("<span>").addClass("title"))
        )
        .append($("<div>").addClass("form"))
    });

    function updateHeader(self, actionItem) {
      self.container.find(".lilIcon").attr("src", actionItem && actionItem.iconUri || "");
      self.container.find(".title").text(actionItem && actionItem.title || "");
    }

    c.defineFunction("open", function(actionItem) {
      var self = this;
      updateHeader(self, actionItem);

      var form = new (ComponentClassFor(actionItem))()
        .addPlugin({
          exit: function() {
            self.invokePlugin("close");
          },
          openActionItem: function(actionItem) {
            self.open(actionItem);
          }
        })
        .open(actionItem);
      form.container.appendTo(self.container.find(".form"));

      if (self.form) {
        new CrossFade(self.form, form).run()
        .then(function() {
          self.form.close();
          self.form.container.remove();
          self.form = form;
        });
      }
      else {
        self.form = form;
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
