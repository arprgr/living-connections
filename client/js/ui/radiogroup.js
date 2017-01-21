// radiogroup.js - Radio Button Group component

define([ "jquery", "ui/component" ],
function($,        Component) {

  return Component.defineClass(function(c) {
    
    c.defineDefaultOptions({
      choices: [],
      groupName: "group"
    });

    function radioSelector(self) {
      // TODO: escape groupName
      return "input:radio[name='" + self.options.groupName + "']";
    }

    c.defineProperty("apparentValue", {
      get: function() {
        var self = this;
        var selector = radioSelector(self) + ":checked";
        return self.container.find(selector).val();
      },
      set: function(value) {
        var self = this;
        if (value != null) {
          self.container.find(radioSelector(self)).each(function(ix, ele) {
            var eleValue = self.options.choices[ix].value;
            var equal = eleValue == value;
            ele.checked = equal;
          });
        }
      }
    });

    c.defineInitializer(function() {
      var self = this;
      var groupName = self.options.groupName;
      var choices = self.options.choices;
      for (var i = 0; i < choices.length; ++i) {
        var choice = choices[i];
        self.container.append($("<div>")
          .append($("<input>")
            .attr("type", "radio")
            .attr("name", groupName)
            .attr("value", choice.value)
            .attr("checked", choice.checked)
            .on("change", function() {
              self.value = self.apparentValue;
            }))
          .append($("<span>")
            .text(choice.label))
        )
      }
      if (self.apparentValue == null && choices.length > 0) {
        self.value = self.apparentValue = choices[0].value;
      }
    });
  });
});
