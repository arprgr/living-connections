// actionitem.js - model class ActionItem

define([ "jquery" ], function($) {

  var titleFormatProperty = {
    get: function() {
      return this.title || "Some activity for %u%"
    }
  }

  var iconUriProperty = {
    get: function() {
      return "/img/" + this.type + ".png";
    }
  }

  function ActionItem(data) {
    $.extend(this, data);
    Object.defineProperty(this, "titleFormat", titleFormatProperty);
    Object.defineProperty(this, "iconUri", iconUriProperty);
  }

  return ActionItem;
});
