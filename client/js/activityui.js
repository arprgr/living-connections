// activityui.js

define([ "jquery", "vid" ], function($, vid) {

  function selectContainer() {
    return $("#app .activity");
  }

  function showUi() {
    selectContainer().show(3000);
  }

  function hideUi() {
    selectContainer().hide(3000);
  }

  function Controller(sessionManager) {
    var self = this;
    self.sessionManager = sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    sessionManager.addActionListener(handleSessionManagerActionChange.bind(self));
  }

  function iconUri(item) {
    return "/img/" + item.type + ".png";
  }

  function render(self) {
    var actionItem = self.actionItem;
    var id = actionItem.id;
    var type = actionItem.type;

    selectContainer()
      .empty()
      .append($("<div>").text(self.activity.title))
      .append($("<div>").append($("<button>").text("Back").click(function() { closeActivity(self); })))
      .append($("<div>")
        .html("<video id='localVideo' autoplay></video>"))
    ;
    var localVideo = document.getElementById("localVideo");
    var localVideoController = new vid.LocalVideoController(localVideo);

    localVideo.addEventListener('loadedmetadata', function() {
      u.trace('Local video videoWidth: ' + this.videoWidth +
        'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    localVideoController.onChangeStream(function(stream) {
      localVideo.srcObject = stream;
    });
  }

  function open(actionItem) {
    var self = this;
    self.actionItem = actionItem;
    render(self);
  }

  function close() {
    var self = this;
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    // TODO: display unresponsive state.
  }

  function handleSessionManagerActionChange() {
    var self = this;
    // TODO: show urgent items.
  }

  Controller.prototype = {
    open: open,
    close: close
  }

  return {
    Controller: Controller
  }
});
