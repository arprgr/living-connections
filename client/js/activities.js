// activities.js - ActivityComponent

define([ "msgviewer", "anneditor",        "greeditor",    "inveditor",      "proeditor",  "usereditor" ],
function( MsgViewer,  AnnouncementEditor, GreetingEditor, InvitationEditor, ProfileEditor, UserEditor) {

  return {
    ClassForActionItem: function(actionItem) {
      if (actionItem.action == "rec") {
        return MsgViewer;
      }
      switch (actionItem.what) {
      case "ann":
        return AnnouncementEditor;
      case "gre":
        return GreetingEditor;
      case "inv":
        return InvitationEditor;
      case "pro":
        return ProfileEditor;
      case "usr":
        return UserEditor;
      }
    }
  }
});
