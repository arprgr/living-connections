// services.js - Services

define([ "api", "session", "vid", "videostore" ],
  function(ApiService, SessionManager, VideoService, VideoStoreService) {

  // Instantiation.

  var apiService = new ApiService({
  });

  var sessionManager = new SessionManager({
    pollingPeriod: 8000,
    retryTolerance: 3
  });

  var videoService = new VideoService({
    mimePriorityList: [
      "video/webm, codecs=vp9",
      "video/webm, codecs=vp8",
      "video/webm"
    ],
    timeChunk: 1000,
    bufferLimit: 100
  });

  var videoStoreService = new VideoStoreService({
  });

  // Hookup.

  return {
    apiService: apiService,
    sessionManager: sessionManager,
    videoService: videoService,
    videoStoreService: videoStoreService
  }
});
