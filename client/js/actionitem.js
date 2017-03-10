// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  function matchProtocol(url) {
    if (window.location.protocol == "https:") {
      url = url.replace(/^http:/, "https:");
    }
    return url;
  }

  function webmToJpg(url) {
    return matchProtocol(url
      .replace(/webm$/, "jpg")
      .replace(/v[0-9]+/, "w_400,h_400,c_crop,g_face,r_max/w_100"));
  }

  function assetIcon(item) {
    return item && item.asset && item.asset.url && webmToJpg(item.asset.url);
  }

  function defaultIcon(actionItem) {
    return "/img/" + actionItem.type + ".png";
  }

  function inviteNameAndEmail(invite) {
    var str = invite.recipientName;
    if (invite.ticket && invite.ticket.email) {
      str += " <" + invite.ticket.email + ">";
    }
    return str;
  }

  var actionProperty = {
    get: function() {
      return this.idParts[1];
    }
  }

  var iconUriProperty = {
    get: function() {
      return assetIcon(this.message) || assetIcon(this.user) || defaultIcon(this);
    }
  }

  var titleProperty = {
    get: function() {
      switch (this.type) {
      case "ann-rec":
        return "Announcement from " + this.userName;
      case "ann-cre":
        return "Make an announcement";
      case "ann-upd":
        return "Update announcement";
      case "gre-rec":
        return "Message from " + this.userName;
      case "gre-cre":
        return (this.isReply ? "Reply to " : "Send a videogram to ") + this.userName;
      case "inv-rec":
        return "Invitation from " + this.userName;
      case "inv-cre":
        return "Invite someone to connect with you";
      case "inv-upd":
        return "Update invitation for " + inviteNameAndEmail(this.invite);
      case "pro-rec":
        return "About " + this.userName + "...";
      case "pro-cre":
        return "Tell other users about you!";
      case "pro-upd":
        return 'Update your "about you" message';
      case "usr-cre":
        return "Start by picking your user name";
      case "usr-upd":
        return "Change your user name";
      }
      return "";
    }
  }

  var typeProperty = {
    get: function() {
      return this.what + "-" + this.action;
    }
  }

  var whatProperty = {
    get: function() {
      return this.idParts[0];
    }
  }

  var userNameProperty = {
    get: function () {
      var user = this.user;
      return (user && user.name) || "another user";
    }
  }

  return function(data) {
    $.extend(this, data);
    this.idParts = data.id.split("-");
    Object.defineProperty(this, "action", actionProperty);
    Object.defineProperty(this, "iconUri", iconUriProperty);
    Object.defineProperty(this, "title", titleProperty);
    Object.defineProperty(this, "type", typeProperty);
    Object.defineProperty(this, "what", whatProperty);
    Object.defineProperty(this, "userName", userNameProperty);
    if (!this.user) {
      this.user = (this.message && this.message.fromUser) || (this.invite && this.invite.fromUser);
    }
  }
});
