// testui.js

define([ "jquery", "button", "anneditor", "services" ], function($, Button, AnnouncementEditor, Services) {

  function Test() {
    var self = this;
  }

  function open(self) {
    var anned = new AnnouncementEditor($("<div>"));

    anned.open();

    $("body").empty().append(anned.container)

    return self;
  }

  Test.prototype = {
    open: function() {
      return open(this);
    }
  }

  return Test;
});
