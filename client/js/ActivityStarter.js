// ActivityStarter.js - logic for selecting, creating, and initializing an activity.

define([ "ConnectionViewer", "MessageViewer", "AnnouncementEditor", "GreetingEditor", "CreateInviteEditor",
  "UpdateInviteEditor", "ProfileEditor", "UserNameEditor", "InviteViewer" ],
function( ConnectionViewer,  MessageViewer,  AnnouncementEditor,   GreetingEditor,   CreateInviteEditor,
  UpdateInviteEditor, ProfileEditor,   UserNameEditor,   InviteViewer) {

  function classForActionItem(actionItem) {
    if (actionItem.topic == "con") {
      return ConnectionViewer;
    }
    if (actionItem.topic == "inv") {
      switch (actionItem.aspect) {
      case "cre":
        return CreateInviteEditor;
      case "upd":
        return UpdateInviteEditor;
      case "rec":
        return InviteViewer;
      }
    }
    if (actionItem.aspect == "rec") {
      return MessageViewer;
    }
    switch (actionItem.topic) {
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
