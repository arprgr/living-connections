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

  function span(text) {
    var ele = $("<span>");
    text && ele.text(text);
    return ele;
  }

  function hilite(str) {
    return span(str).addClass("hilite");
  }

  function inviteNameAndEmail(invite) {
    var ele = hilite(invite.recipientName);
    if (invite.ticket && invite.ticket.email) {
      ele = span().append(ele).append(span("<" + invite.ticket.email + ">"));
    }
    return ele;
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
        return span("Announcement from ").append(hilite(this.userName));
      case "ann-cre":
        return span("Make an announcement");
      case "ann-upd":
        return span("Update announcement");
      case "gre-rec":
        return span("Message from ").append(hilite(this.userName));
      case "gre-cre":
        return span(this.isReply ? "Reply to " : "Send a videogram to ").append(hilite(this.userName));
      case "inv-rec":
        return span("Invitation from ").append(hilite(this.userName));
      case "inv-cre":
        return span("Invite someone to connect with you");
      case "inv-upd":
        return span("Update invitation for ").append(inviteNameAndEmail(this.invite));
      case "pro-rec":
        return span("About ").append(hilite(this.userName)).append(span("..."));
      case "pro-cre":
        return span("Tell other users about you!");
      case "pro-upd":
        return span('Update your "about you" message');
      case "usr-cre":
        return span("Start by picking your user name");
      case "usr-upd":
        return span("Change your user name");
      }
      return span();
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
