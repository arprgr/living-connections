// activities.js - ActivityComponent

define([ "MessageViewer", "AnnouncementEditor", "GreetingEditor", "CreateInviteEditor",
  "UpdateInviteEditor", "ProfileEditor", "usereditor", "InviteViewer" ],
function( MessageViewer,  AnnouncementEditor,   GreetingEditor,   CreateInviteEditor,
  UpdateInviteEditor, ProfileEditor,   UserEditor,   InviteViewer) {

  return {
    ClassForActionItem: function(actionItem) {
      if (actionItem.what == "inv") {
        switch (actionItem.action) {
        case "cre":
          return CreateInviteEditor;
        case "upd":
          return UpdateInviteEditor;
        case "rec":
          return InviteViewer;
        }
      }
      if (actionItem.action == "rec") {
        return MessageViewer;
      }
      switch (actionItem.what) {
      case "ann":
        return AnnouncementEditor;
      case "gre":
        return GreetingEditor;
      case "pro":
        return ProfileEditor;
      case "usr":
        return UserEditor;
      }
    }
  }
});
