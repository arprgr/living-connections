// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  function getUser(actionItem) {
    return actionItem.user || (actionItem.message && actionItem.message.fromUser);
  }

  function userName(actionItem) {
    var user = getUser(actionItem);
    return (user && user.name) || "another user";
  }

  function matchProtocol(url) {
    if (window.location.protocol == "https:") {
      url = url.replace(/^http:/, "https:");
    }
    return url;
  }

  function webmToJpg(url) {
    return url
      .replace(/webm$/, "jpg")
      .replace(/v[0-9]+/, "w_400,h_400,c_crop,g_face,r_max/w_100");
  }

  function assetIcon(item) {
    return item && item.asset && item.asset.url && webmToJpg(item.asset.url);
  }

  function defaultIcon(actionItem) {
    return "/img/" + actionItem.type + ".png";
  }

  var iconUriProperty = {
    get: function() {
      return assetIcon(this.message) || assetIcon(getUser(this)) || defaultIcon(this);
    }
  }

  var titleProperty = {
    get: function() {
      switch (this.type) {
      case "ann-rec":
        return "Announcement from " + userName(this);
      case "ann-cre":
        return "Make an announcement";
      case "ann-upd":
        return "Update announcement";
      case "gre-rec":
        return "Message from " + userName(this);
      case "gre-cre":
        return (this.isReply ? "Reply to " : "Send a greeting to ") + userName(this);
      case "inv-rec":
        return "Invitation from " + userName(this);
      case "inv-cre":
        return "Invite someone to connect with you";
      case "inv-upd":
        return "Update invitation for " + this.invite.email;
      case "pro-rec":
        return userName(this) + "'s profile";
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
