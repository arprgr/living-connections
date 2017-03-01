// activities.js - ActivityComponent

define([ "msgviewer", "AnnouncementEditor", "GreetingEditor", "CreateInviteEditor", "inveditor",
  "ProfileEditor", "usereditor" ],
function( MsgViewer,  AnnouncementEditor,   GreetingEditor,   CreateInviteEditor,   UpdateInviteEditor,
  ProfileEditor,   UserEditor) {

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
        return actionItem.action == "cre" ? CreateInviteEditor : UpdateInviteEditor;
      case "pro":
        return ProfileEditor;
      case "usr":
        return UserEditor;
      }
    }
  }
});
