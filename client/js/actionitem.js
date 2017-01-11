// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  var iconUriProperty = {
    get: function() {
      return "/img/" + this.type + ".png";
    }
  }

  function formatUser(user) {
    return user.name;
  }

  function formatAnnouncement(announcement) {
    return "Announcement from " + formatUser(announcement.creator);
  }

  function formatGreeting(greeting) {
    return "Greeting from " + formatUser(greeting.fromUser);
  }

  function formatInvitation(invitation) {
    return "Invitation";
  }

  var titleProperty = {
    get: function() {
      switch (this.type) {
      case "ann-rec":
        return formatAnnouncement(this.announcement);
      case "ann-cre":
        return "Make an announcement";
      case "ann-upd":
        return "Update " + formatAnnouncement(this.announcement);
      case "gre-rec":
        return formatGreeting(this.greeting);
      case "gre-cre":
        return (this.isReply ? "Reply to " : "Send a greeting to ") + formatUser(this.user);
      case "inv-rec":
        return formatInvitation(this.invitation);
      case "inv-cre":
        return "Invite someone to connect with you";
      case "inv-upd":
        return "Update " + formatInvitation(this.announcement);
      case "pro-rec":
        return formatUser(this.user) + "'s profile";
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
    Object.defineProperty(this, "iconUri", iconUriProperty);
    Object.defineProperty(this, "title", titleProperty);
  }
});
