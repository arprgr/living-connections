// services.js - Services

define([ "api",      "fb",            "session",      "vid" ],
function(ApiService, FacebookService, SessionManager, VideoService) {

  // Instantiation.

  var apiService = new ApiService({
  });

  var facebookService = new FacebookService({
    appId: "1093072224140701",
    version: "v2.8"
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

  // Hookup.

  return {
    apiService: apiService,
    facebookService: facebookService,
    sessionManager: sessionManager,
    videoService: videoService
  }
});
