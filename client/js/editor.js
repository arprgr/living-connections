// editor.js - Editor: a framework component class: an Activity that creates/modifies an entity.

define([ "jquery", "services", "activityui", "ui/index" ],
function($,        Services,   Activity,     ui) {

  // A summarized panel
  var Summary = ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      var self = this;
      var label = new ui.Component($("<span>").addClass("summary"));
      self.container
        .addClass("panel")
        .append(label.container)
        .append($("<span>").text(" "))
        .append(ui.Link.create("Change", function() {
          self.requestOpen();
        }).container);
      self.label = label;
    });

    c.extendPrototype({
      open: function() {
        this.label.text = this.invokePlugin("summarize");
        this.invokePlugin("openSummary");
        return this;
      },
      requestOpen: function() {
        this.invokePlugin("requestOpen");
      }
    });
  });

  // An open editor panel
  var Form = ui.Component.defineClass(function(c) {

    c.defineInitializer(function() {
      this.container.addClass("panel")
    });

    c.extendPrototype({
      open: function() {
        this.invokePlugin("openForm");
        return this;
      },
      close: function() {
        this.invokePlugin("formClosing");
        return this;
      }
    });
  });

  var SUMMARY = "summary";
  var FORM = "form";

  // A collapsable panel.  Has two states: summary and form.
  var Cell = ui.Carton.defineClass(function(c) {

    c.defineDefaultOptions({
      initialState: SUMMARY,
      outputProperties: []
    });

    c.defineInitializer(function() {
      var self = this;
      self.addCompartment(SUMMARY, self.summary = new Summary().addPlugin(self));
      self.addCompartment(FORM, self.form = new Form().addPlugin(self));
    });

    c.defineProperty("data", {
      get: function() {
        return this.parent.data;
      }
    });

    c.defineProperty("actionItem", {
      get: function() {
        return this.parent.actionItem;
      }
    });

    c.defineProperty("isLacking", {
      get: function() {
        var self = this;
        if (!self.data) return true;
        var outputProperties = self.options.outputProperties;
        for (var i = 0; i < outputProperties.length; ++i) {
          if (self.data[outputProperties[i]] == null) {
            return true;
          }
        }
        return false;
      }
    });

    c.extendPrototype({
      exit: function() {
        this.invokePlugin("exit");
      },
      requestOpen: function() {
        this.invokePlugin("requestOpen");
      },
      advance: function() {
        this.invokePlugin("advance");
      },
      summarize: function() {},
      formClosing: function() {
        this.invokePlugin("formClosing");
      }
    });
  });

  var Editor = Activity.defineClass(function(c) {

    c.defineDefaultOptions({
      cells: [],
      exitLinkText: "Cancel"
    });

    function makeCell(self, cellDesc, index) {
      if (typeof cellDesc == "function") {
        cellDesc = {
          cons: cellDesc,
          options: {}
        };
      }
      var cell = new (cellDesc.cons)($("<div>"), cellDesc.options)
        .addPlugin(self)
        .addPlugin({
          requestOpen: function() {
            return self.openByIndex(index);
          }
        })
      cell.parent = self;
      return cell;
    }

    function submit(self, action) {
      var actionItem = self.actionItem;
      var data = self.data;
      Services.apiService.saveForm(actionItem.what, action || actionItem.action, data).then(function() {
        self.exit();
      }).catch(function(err) {
        console.log(err);
      });
    }

    function Editor_openByIndex(self, newIndex) {
      if (newIndex != self.cellIndex) {
        if (self.cellIndex >= 0) {
console.log('summarize', self.cellIndex);
          self.cells[self.cellIndex].show(SUMMARY);
        }
        if (newIndex >= 0 && newIndex < self.cells.length) {
          self.cellIndex = newIndex;
          self.cells[newIndex].show(FORM);
        }
        else {
          self.cellIndex = -1;
        }
      }
      return self;
    }

    function Editor_advance(self) {
      var newIndex = self.cellIndex + 1;
      while (newIndex < self.cells.length && !self.cells[newIndex].isLacking) {
        ++newIndex;
      }
      return Editor_openByIndex(self, newIndex);
    }

    function anyLacking(self) {
      for (var i = 0; i < self.cells.length; ++i) {
        if (self.cells[i].isLacking) {
          return true;
        }
      }
      return false;
    }

    function updateDoneButton(self) {
      self.doneButton.enabled = !anyLacking(self);
    }

    c.defineInitializer(function() {
      var self = this;
      var cells = [];

      for (var i = 0; i < self.options.cells.length; ++i) {
        var cell = makeCell(self, self.options.cells[i], i);
        cells.push(cell);
        self.container.append(cell.container);
      }

      var deleteButton = ui.Button.create("Delete!", function() {
        submit(self, "del");
      }).setVisible(self.actionItem.type == "ann-upd");

      var doneButton = ui.Button.create("Done", function() {
        submit(self);
      });

      var cancelButton = ui.Button.create("Cancel", function() {
        self.exit();
      });

      self.container.append($("<div>")
        .addClass("panel")
        .append(deleteButton.container)
        .append(doneButton.container)
        .append(cancelButton.container));

      self.cells = cells;
      self.cellIndex = -1;
      self.doneButton = doneButton;
    });

    c.defineProperty("actionItem", {
      get: function() {
        return this.options.actionItem;
      }
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        self.data = $.extend({}, self._initData() || {});
        self.cellIndex = -1;
        for (var i = 0; i < self.cells.length; ++i) {
          var cell = self.cells[i];
          cell.open();
          if (self.cellIndex < 0 && cell.isLacking) {
            self.cellIndex = i;
            cell.show(FORM);
          }
        }
        updateDoneButton(self);
        return Activity.prototype.open.call(self);
      },
      close: function() {
        var self = this;
        for (var i = 0; i < self.cells.length; ++i) {
          self.cells[i].close();
        }
        return self;
      },
      _initData: function() {
      },
      openByIndex: function(newIndex) {
        return Editor_openByIndex(this, newIndex);
      },
      advance: function() {
        return Editor_advance(this);
      },
      exit: function() {
        this.invokePlugin("exit");
      },
      formClosing: function() {
        updateDoneButton(this);
      }
    });
  });

  Editor.Cell = Cell;

  return Editor;
});
