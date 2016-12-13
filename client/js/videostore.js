// videostore.js

define([ "http" ], function(HttpMethod) {

  function Service(config) {
    this.SaveVideoMethod = new HttpMethod.PostBinary("video/webm")
      .addPathComponent("/videos")
      .build();
  }

  function saveVideo(service, blob) {
    return new service.SaveVideoMethod()
      .setBody(blob)
      .execute();
  }

  Service.prototype = {
    saveVideo: function(blob) {
      return saveVideo(this, blob);
    }
  }

  return Service;
});
