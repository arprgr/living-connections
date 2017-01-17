// greeditor.js - Greeting Editor component

define([ "editor", "vidrec" ],
function(Editor,   VideoRecorder) {

  return Editor.defineClass(function(c) {
    c.defineDefaultOptions({
      forms: [ VideoRecorder ]
    });
    c.extendPrototype({
      _initData: function() {
        return {
          toUserId: this.actionItem.user.id
        }
      }
    });
  });
});
