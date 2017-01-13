// activities.js - ActivityComponent

define([ "msgviewer", "greeditor", "inveditor", "proeditor" ],
  function(MsgViewer, GreetingEditor, InvitationEditor, ProfileEditor) {

  return {
    ClassForActionItem: function(actionItem) {
      var parts = actionItem.type.split("-");
      var what = parts[0];
      var action = parts[1];
      if (action == "rec") {
        return MsgViewer;
      }
      switch (what) {
      case "ann":
        return AnnouncementEditor;
      case "gre":
        return GreetingEditor;
      case "inv":
        return InvitationEditor;
      case "pro":
        return ProfileEditor;
      }
    }
  }
});
