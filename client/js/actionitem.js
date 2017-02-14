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

  var actionProperty = {
    get: function() {
      return this.idParts[1];
    }
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
        return "About " + userName(this) + "...";
      case "pro-cre":
        return "Tell other users about you!";
      case "pro-upd":
        return 'Update your "about you" message';
      case "usr-cre":
      case "usr-upd":
        return "Set your user name";
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

  return function(data) {
    $.extend(this, data);
    this.idParts = data.id.split("-");
    Object.defineProperty(this, "action", actionProperty);
    Object.defineProperty(this, "iconUri", iconUriProperty);
    Object.defineProperty(this, "title", titleProperty);
    Object.defineProperty(this, "type", typeProperty);
    Object.defineProperty(this, "what", whatProperty);
  }
});
