// sendmessage.js
// UX manager for this piece.

define([ "jquery", "media" ], function($, media) {

  function Controller() {
    this.promise = $.Deferred();
  }

  function init() {
    var self = this;
    try {
      var mediaService = new media.MediaService();
      mediaService.init();
    }
    catch (e) {
      clearTimeout(timeout);
      self.promise.reject(e);
    }
    return self.promise;
  }

  Controller.prototype = {
    start: start
  }

  return {
    Controller: Controller
  }
});
