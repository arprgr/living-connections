// activityui.js

define([ "jquery", "services" ], function($, Services) {

  var sessionManager = Services.sessionManager;
  var videoService = Services.videoService;

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

  function functionButton(label, clickFunc) {
    return $("<div>")
      .addClass("function")
      .text(label)
      .click(clickFunc);
  }

  function startRecording(self) {
    console.log("start");
  }

  function stopRecording(self) {
    console.log("stop");
  }

  function renderFunctionButtons(self) {
    var container = $("<div>").addClass("functions");

    self.startRecordingButton = functionButton("Start Recording", function() {
      startRecording(self);
    }).appendTo(container);

    self.stopRecordingButton = functionButton("Stop Recording", function() {
      stopRecording(self);
    }).appendTo(container);

    return container;
  }

  function render(self) {
    var actionItem = self.openActionItem;
    var id = actionItem.id;
    var type = actionItem.type;

    selectContainer()
      .empty()
      .append($("<div>")
        .addClass("action")
        .append($("<img>")
          .attr("src", iconUri(actionItem)))
          .append($("<a>")
            .addClass("exit")
            .text("Exit")
            .attr("href", "#")
            .click(function() { self.closeFunc && self.closeFunc(); }))
        .append($("<div>")
          .addClass("vid")
          .html("<video id='localVideo' autoplay></video>"))
        .append(renderFunctionButtons(self))
      );
    var localVideo = document.getElementById("localVideo");

    localVideo.addEventListener("loadedmetadata", function() {
      console.log("Local video width=" + this.videoWidth + "  height=" + this.videoHeight);
    });

    videoService.open().then(function(stream) {
      document.getElementById("localVideo").srcObject = stream;
    });

    renderFunctionButtons(self);
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    // TODO: display unresponsive state.
  }

  function handleSessionManagerActionChange() {
    var self = this;
    // TODO: show urgent items.
  }

  function open(self, actionItem) {
    self.openActionItem = new ActionItem(actionItem);
    render(self);
    return self;
  }

  function close(self) {
    self.openActionItem = null;
    videoService.close();
    selectContainer().empty();
    return self;
  }

  function Controller() {
    var self = this;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
  }

  Controller.prototype = {
    showOrHide: function(doShow) {
      selectContainer()[doShow ? "show" : "hide"]();
    },
    onActivityClose: function(func) {
      var self = this;
      self.closeFunc = func;
      return self;
    },
    open: function(actionItem) {
      return open(this, actionItem);
    },
    close: function() {
      return close(this);
    }
  }

  return Controller;
});
