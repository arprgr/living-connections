// bootproc.js

define([ "jquery", "media" ], function($, media) {

  var APP_NAME = "LivingConnections";

  function BootProcess() {
    this.promise = $.Deferred();
  }

  function start() {
    var self = this;
    var module = angular.module(APP_NAME, []);
    var timeout = setTimeout(function() {
      self.promise.resolve({});
    }, 10000);
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

  BootProcess.prototype = {
    start: start
  }

  return {
    BootProcess: BootProcess
  }
});
