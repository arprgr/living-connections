// ActivityStarter.js - logic for selecting, creating, and initializing an activity.

define([ "MessageViewer", "AnnouncementEditor", "GreetingEditor", "CreateInviteEditor",
  "UpdateInviteEditor", "ProfileEditor", "UserNameEditor", "InviteViewer" ],
function( MessageViewer,  AnnouncementEditor,   GreetingEditor,   CreateInviteEditor,
  UpdateInviteEditor, ProfileEditor,   UserNameEditor,   InviteViewer) {

  function classForActionItem(actionItem) {
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
      return UserNameEditor;
    }
  }

  return {
    startActivityFor: function(actionItem) {
      var ActivityClass = classForActionItem(actionItem);
      return new ActivityClass("<div>", { actionItem: actionItem })
    }
  }
});
