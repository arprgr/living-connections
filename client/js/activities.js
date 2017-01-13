// activities.js - ActivityComponent

define([ "annviewer", "greviewer", "invviewer", "proviewer",
  "greeditor", "inveditor", "proeditor" ],
function(AnnouncementViewer, GreetingViewer, InvitationViewer, ProfileViewer,
  GreetingEditor, InvitationEditor, ProfileEditor) {

  return {
    ClassForActionItem: function(actionItem) {
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
  }
});
