// ActionItem.js - model class ActionItem

define([ "jquery", "Asset" ], function($, Asset) {

  function defaultIcon(idParts) {
    return "/img/" + idParts[0] + "-" + idParts[1] + ".png";
  }

  function span(text) {
    var ele = $("<span>");
    text && ele.text(text);
    return ele;
  }

  function hilite(str) {
    return span(str).addClass("hilite");
  }

  function userName(data, path) {
    var name = data;
    for (var i = 0; name && i < path.length; ++i) {
      name = name[path[i]];
    }
    if (name) name = name.name;
    return name ? hilite(name) : span("another user");
  }

  function inviteNameAndEmail(invite) {
    var ele = hilite(invite.recipientName);
    if (invite.ticket && invite.ticket.email) {
      ele = span().append(ele).append(span("<" + invite.ticket.email + ">"));
    }
    return ele;
  }

  function titleFunc(topic, aspect, data) {
    switch (topic + "-" + aspect) {
    case "ann-rec":
      return span("Announcement from ").append(userName(data, [ "message", "fromUser" ]));
    case "ann-cre":
      return span("Make an announcement");
    case "ann-upd":
      return span("Update announcement");
    case "gre-rec":
      return span("Message from ").append(userName(data, [ "user" ]));
    case "gre-cre":
      return span("Send a videogram to ").append(userName(data, [ "user" ]));
    case "inv-rec":
      return span("Invitation from ").append(userName(data, [ "invite", "fromUser" ]));
    case "inv-cre":
      return span("Invite someone to connect with you");
    case "inv-upd":
      return span("Update invitation for ").append(inviteNameAndEmail(data.invite));
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

  // Constructed by wrapping a JSON object.
  return function(data) {
    var idParts = data.id.split("-");

    var asset = (data.message && data.message.asset) || (data.user && data.user.asset);
    if (asset) asset = new Asset(asset);

    Object.defineProperty(this, "id", {
      get: function() {
        return data.id;
      }
    });

    Object.defineProperty(this, "topic", {
      get: function() {
        return idParts[0];
      }
    });

    Object.defineProperty(this, "aspect", {
      get: function() {
        return data.aspect || idParts[1];
      }
    });

    Object.defineProperty(this, "iconUrl", {
      get: function() {
        return (asset && asset.iconUrl) || defaultIcon(idParts);
      }
    });

    Object.defineProperty(this, "title", {
      get: function() {
        return titleFunc(idParts[0], this.aspect, data);
      }
    });

    Object.defineProperty(this, "subtitle", {
      get: function() {
        return span();
      }
    });

    Object.defineProperty(this, "raw", {    // TEMPORARY
      get: function() {
        return data;
      }
    });
  }
});
