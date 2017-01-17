// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  var iconUriProperty = {
    get: function() {
      return "/img/" + this.type + ".png";
    }
  }

  function userName(user) {
    return (user && user.name) || "Another user";
  }

  var titleProperty = {
    get: function() {
      switch (this.type) {
      case "ann-rec":
        return "Announcement from " + userName(this.message.fromUser);
      case "ann-cre":
        return "Make an announcement";
      case "ann-upd":
        return "Update announcement";
      case "gre-rec":
        return "Message from " + userName(this.message.fromUser);
      case "gre-cre":
        return (this.isReply ? "Reply to " : "Send a greeting to ") + userName(this.user);
      case "inv-rec":
        return "Invitation from " + userName(this.message.fromUser);
      case "inv-cre":
        return "Invite someone to connect with you";
      case "inv-upd":
        return "Update invitation for " + userName(this.invite.email);
      case "pro-rec":
        return userName(this.user) + "'s profile";
      case "pro-cre":
        return "Create your profile";
      case "pro-upd":
        return "Update your profile";
      }
      return "";
    }
  }

  return function(data) {
    $.extend(this, data);
    var parts = data.type.split("-");
    this.what = parts[0];
    this.action = parts[1];
    Object.defineProperty(this, "iconUri", iconUriProperty);
    Object.defineProperty(this, "title", titleProperty);
  }
});
