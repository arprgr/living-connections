// UI classes
(function() {

  var CLASS_LIST = [
    "Audio",
    "Button",
    "Carton",
    "Component",
    "ConfirmButton",
    "DateTimeInput",
    "EmailInput",
    "FadeGoal",
    "Image",
    "Observable",
    "RadioGroup",
    "TextInput",
    "Video" 
  ]

  function getPaths() {
    var paths = [];
    for (var i = 0; i < CLASS_LIST.length; ++i) {
      paths.push("ui/" + CLASS_LIST[i].toLowerCase());
    }
    return paths;
  }

  define(getPaths(), function() {
    var module = {};
    for (var i = 0; i < CLASS_LIST.length; ++i) {
      module[CLASS_LIST[i]] = arguments[i];
    }
    return module;
  });
})();
