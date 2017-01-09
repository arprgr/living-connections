// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  var iconUriProperty = {
    get: function() {
      return "/img/" + this.type + ".png";
    }
  }

  function ActionItem(data) {
    $.extend(this, data);
    Object.defineProperty(this, "iconUri", iconUriProperty);
  }

  return ActionItem;
});
