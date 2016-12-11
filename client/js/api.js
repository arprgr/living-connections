// api.js - ApiService

define([ "jquery", "http", "obs" ], function($, HttpMethod, Observable) {

  function execute(method, params) {
    var promise = $.Deferred();
    method.execute(params, function(response) {
      promise.resolve(response);
    }, function(error) {
      promise.reject(error);
    });
    return promise;
  }

  var POST_GREETING = new HttpMethod("POST", "/messages", [ "fromUserId", "toUserId", "assetId" ]);
  var POST_PROFILE = new HttpMethod("POST", "/profiles", [ "userId", "assetId" ]);
  var PUT_PROFILE = new HttpMethod("PUT", "/profiles", [ "userId", "assetId" ]);
  var POST_INVITATION = new HttpMethod("POST", "/invites", [ "fromUserId", "toAddress", "assetId" ]);
  var POST_ANNOUNCEMENT = new HttpMethod("POST", "/announcements", [ "fromUserId", "assetId" ]);

  function ApiService(options) {
  }

  ApiService.prototype = {

    postGreeting: function(params) {
      return execute(POST_GREETING, params);
    },

    postProfile: function(params) {
      return execute(POST_PROFILE, params);
    },

    updateProfile: function(params) {
      return execute(PUT_PROFILE, params);
    },

    postInvitation: function() {
      return execute(POST_GREETING, params);
    }
  }

  return ApiService;
});
