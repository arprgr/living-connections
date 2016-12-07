// listingui.js

define([ "jquery" ], function($) {

  function selectContainer() {
    return $("#app .listing");
  }

  function setVisible(doShow) {
    selectContainer()[doShow ? "show" : "hide"](3000);
  }

  function iconUri(item) {
    return "/img/" + item.type + ".png";
  }

  function handleItemClick(self, item) {
    self.isOpen && self.actionItemOpenFunc && self.actionItemOpenFunc(item);
  }

  function renderActionItem(self, item) {
    return $("<div>")
      .addClass("action")
      .append($("<img>")
        .attr("src", iconUri(item)))
      .append($("<div>")
        .addClass("title")
        .text(item.title))
      .click(function() {
        handleItemClick(self, item);
      });
  }

  function render(self) {
    var $body = selectContainer().empty();
    var actionItems = self.actionItems;
    if (actionItems) {
      for (var i = 0; i < actionItems.length; ++i) {
        $body.append(renderActionItem(self, actionItems[i]));
      }
    }
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
  }

  function handleSessionManagerActionChange(actionItems) {
    var self = this;
    self.actionItems = actionItems;
    if (self.isOpen) {
      render(self);
    }
  }

  function Controller(sessionManager) {
    var self = this;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
  }

  function open() {
    var self = this;
    if (!self.isOpen) {
      render(self);
      self.isOpen = true;
    }
    return self;
  }

  function close() {
    var self = this;
    self.isOpen = false;
    return self;
  }

  function onActionItemOpen(func) {
    var self = this;
    self.actionItemOpenFunc = func;
    return self;
  }

  Controller.prototype = {
    setVisible: setVisible,
    open: open,
    close: close,
    onActionItemOpen: onActionItemOpen
  }

  return Controller;
});
