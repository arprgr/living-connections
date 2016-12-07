// http.js

define(function() {

  function salt() {
    return String(Math.floor(0xffffffff * Math.random()));
  }

  function formatUrl(uriPattern, params) {
    var url = uriPattern.replace(/%salt%/, salt());
    for (var k in params) {
      url = url.replace(new RegExp("%" + k + "%"), encodeURIComponent(params[k]));
    }
    return url;
  }

  function Method(arg0, arg1) {
    var self = this;
    if (arg1 === undefined) {
      this.method = "GET";
      this.uriPattern = arg0;
    }
    else {
      this.method = arg1;
      this.uriPattern = arg1;
    }
  }

  function execute(params, handleDone, handleError) {
    var self = this;
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
      if (req.status === 200) {
        if (handleDone) {
          handleDone(JSON.parse(req.responseText));
        }
      }
      else {
        if (handleError) {
          handleError(new Error("status " + req.status));
        }
      }
    });
    if (handleError) {
      req.addEventListener("error", function(e) {
        handleError(e);
      });
    }
    req.open(self.method, formatUrl(self.uriPattern, params || {}));
    req.send();
  }

  Method.prototype = {
    execute: execute
  }

  return Method;
});
