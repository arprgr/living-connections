// testui.js

define([ "jquery", "button", "anneditor", "inveditor"], function($, Button, AnnouncementEditor, InvitationEditor) {

  function Test() {
    var self = this;
  }

  function open(self) {
    var anned = new AnnouncementEditor($("<div>").addClass("bleh"))
      .setVisible(false);
    var inved = new InvitationEditor($("<div>").addClass("bleh"))
      .setVisible(false);

    var openEditor;

    function start(editor) {
      $("div.bleh").hide();
      $("div.buttons").hide();
      if (openEditor) openEditor.close();
      editor.visible = true;
      editor.open();
      openEditor = editor;
    }

    anned.onCancel = inved.onCancel = function() {
      openEditor.setVisible(false).close();
      openEditor = null;
      $("div.buttons").show();
    }

    $("body")
      .empty()
      .append(anned.container)
      .append(inved.container)
      .append($("<div>")
        .addClass("buttons")
        .append(new Button().setLabel("New Announcement").onClick(function() {
          start(anned);
        }).container)
        .append(new Button().setLabel("New Invitation").onClick(function() {
          start(inved);
        }).container)
      )

    return self;
  }

  Test.prototype = {
    open: function() {
      return open(this);
    }
  }

  return Test;
});
