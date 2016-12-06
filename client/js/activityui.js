// activityui.js

define([ "jquery", "vid" ], function($, vid) {

  function ActionItem(data) {
    var self = this;
    $.extend(self, data);
    Object.defineProperty(self, "titleFormat", {
      get: function() {
        return this.title || "Some activity for %u%"
      }
    });
  }

  function selectContainer() {
    return $("#app .activity");
  }

  function iconUri(item) {
    return "/img/" + item.type + ".png";
  }

  function fireClose(self) {
    self.closeFunc && self.closeFunc();
  }

  function render(self) {
    var actionItem = self.openActionItem;

    var container = selectContainer().empty();
    
    if (actionItem) {
      var id = actionItem.id;
      var type = actionItem.type;

      container
        .append($("<div>")
          .addClass("action")
          .append($("<img>")
            .attr("src", iconUri(actionItem)))
            .append($("<a>")
              .addClass("exit")
              .text("Exit")
              .attr("href", "#")
              .click(function() { fireClose(self); }))
          .append($("<div>")
            .addClass("vid")
            .html("<video id='localVideo' autoplay></video>"))
          .append($("<div>")
            .addClass("functions")
            .text("your functions here"))
        );
      var localVideo = document.getElementById("localVideo");

      localVideo.addEventListener("loadedmetadata", function() {
        console.log("Local video width=" + this.videoWidth + "  height=" + this.videoHeight);
      });

      self.localVideoController.open().then(function(stream) {
        document.getElementById("localVideo").srcObject = stream;
      });
    }
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    // TODO: display unresponsive state.
  }

  function handleSessionManagerActionChange() {
    var self = this;
    // TODO: show urgent items.
  }

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
    self.localVideoController = new vid.LocalVideoController();
  }

  function onActivityClose(func) {
    var self = this;
    self.closeFunc = func;
    return self;
  }

  function showOrHide(doShow) {
    selectContainer()[doShow ? "show" : "hide"](3000);
  }

  function open(actionItem) {
    var self = this;
    self.openActionItem = new ActionItem(actionItem);
    render(self);
    return self;
  }

  function close() {
    var self = this;
    self.openActionItem = null;
    self.localVideoController.close();
    render(self);
    return self;
  }

  Controller.prototype = {
    showOrHide: showOrHide,
    onActivityClose: onActivityClose,
    open: open,
    close: close
  }

  return {
    Controller: Controller
  }
});
