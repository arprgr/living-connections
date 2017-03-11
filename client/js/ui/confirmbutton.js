// ConfirmButton.js - Button that must be clicked twice to activate.

define([ "ui/button" ], function(Button) {

  var ConfirmButton = Button.defineClass(function(c) { 

    c.defineDefaultOptions({
      confirmLabel: "Press again to confirm",
      confirmTimeout: 3000
    });

    c.defineInitializer(function() {
      var self = this;
      self.deleteCount = 0;
    });

    function reset(self) {
      self.label = self.savedLabel;
      self.deleteCount = 0;
    }

    function click(self) {
      clearTimeout(self.deleteTimeout);
      switch (++self.deleteCount) {
      case 1:
        self.savedLabel = self.label;
        self.label = self.options.confirmLabel;
        self.deleteTimeout = setTimeout(function() {
          reset(self);
        }, self.options.confirmTimeout);
        break;
      case 2:
        Button.prototype.click.apply(self);
        reset(self);
      }
    }

    c.extendPrototype({
      click: function() {
        click(this);
      }
    });
  })

  ConfirmButton.create = function(label, clickFunc) {
    return new ConfirmButton().setLabel(label).addPlugin({
      onClick: clickFunc
    });
  }

  return ConfirmButton;
});
