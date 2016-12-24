// emailinput.js - EmailInputComponent

define([ "jquery" ], function($) {

  var EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,3}$/;

  function isValidEmail(str) {
    return str.match(EMAIL_REGEX);
  }

  function EmailInputComponent(container) {
    this.container = container;
    this._render();
  }

  function selectInput(self) {
    return self.container.find("input");
  }

  function showInvalid(self) {
    selectInput(self).addClass("invalid").select();
    self.onInvalidFunc && self.onInvalidFunc();
  }

  function showValid(self) {
    selectInput(self).removeClass("invalid");
    self.onValidFunc && self.onValidFunc();
  }

  function activate(self) {
    var text = selectInput(self).val();
    if (text) {
      if (isValidEmail(text)) {
        showValid(self);
        self.onSubmitFunc && self.onSubmitFunc(text.toLowerCase());
      }
      else {
        showInvalid(self);
      }
    }
    else {
      showValid(self);
    }
  }

  function render(self) {
    self.container.append($("<input>")
      .attr("type", "text")
      .on("keydown", function(event) {
        showValid(self);
        if (event.originalEvent.keyCode == 13) {
          activate(self);
        }
        return true;
      }));
  }

  EmailInputComponent.prototype = {
    show: function() {
      var self = this;
      self.container.show();
      selectInput(self).focus().select();
    },
    hide: function() {
      self.container.hide();
    },
    activate: function() {
      activate(this);
    },
    _render: function() {
      render(this);
    },
    onValid: function(func) {
      this.onValidFunc = func;
      return this;
    },
    onInvalid: function(func) {
      this.onInvalidFunc = func;
      return this;
    },
    onSubmit: function(func) {
      this.onSubmitFunc = func;
      return this;
    },
    focus: function() {
      selectInput(this).focus().select();
    }
  }

  return EmailInputComponent;
});
