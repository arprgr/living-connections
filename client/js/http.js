// http.js

define([ "jquery" ], function($) {

  var GET = "GET";
  var POST = "POST";
  var PUT = "PUT";

  function salt() {
    return String(Math.floor(0xffffffff * Math.random()));
  }

  function expandTokens(uriPattern, params) {
    var url = uriPattern;
    if (url) {
      url = url.replace(/%salt%/, salt());
      for (var k in params) {
        url = url.replace(new RegExp("%" + k + "%"), encodeURIComponent(params[k]));
      }
    }
    return url;
  }

  function Method(arg0, arg1, arg2) {
    var self = this;
    if (arg1 === undefined) {
      this.method = GET;
      this.uriPattern = arg0;
    }
    else {
      this.method = arg0;
      this.uriPattern = arg1;
      this.dataPattern = arg2;
    }
  }

  Method.prototype = {
    execute: function(params, handleDone, handleError) {
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
      req.open(self.method, expandTokens(self.uriPattern, params || {}));
      req.send(expandTokens(self.dataPattern, params || {}));
    }
  }

  ////////////// HttpDyn

  function HttpDyn(method, baseUrl, path, query) {
    this.method = method;
    this.baseUrl = baseUrl;
    this.path = path;
    this.query = query;
    this.params = {};
  }

  function buildQuery(self) {
    var queryString = "";
    var query = self.query;
    for (var i = 0; i < query.length; ++i) {
      var q = query[i];
      var pval = q.value || self.params[q.key];
      if (pval != null) {
        if (queryString) queryString += "&";
        queryString += q.lhs;
        if (pval !== true) {
          queryString += "=" + encodeURIComponent(String(pval));
        }
      }
    }
    return queryString;
  }

  function buildUri(self) {
    var uri = self.baseUrl;
    var path = self.path;
    for (var i = 0; i < path.length; ++i) {
      var comp = path[i];
      if (comp.value) {
        var comps = comp.value.split("/");
        for (var j = 0; j < comps.length; ++j) {
          if (!uri.endsWith("/")) {
            uri += "/";
          }
          uri += comps[j];
        }
      }
      else {
        var pval = self.params[comp.key];
        if (!uri.endsWith("/")) {
          uri += "/";
        }
        uri += encodeURIComponent(String(pval));
      }
    }
    if (self.method === GET) {
      var query = buildQuery(self);
      if (query) {
        uri += "?" + query;
      }
    }
    return uri;
  }

  function buildBody(self) {
    switch (self.method) {
    case POST:
    case PUT:
      return buildQuery(self);
    }
  }

  HttpDyn.prototype = {
    set: function(key, value) {
      this.params[key] = value;
    },
    uri: function() {
      return buildUri(this);
    },
    body: function() {
      return buildBody(this);
    }
  }

  ////////////// HttpMethodBuilder

  function HttpMethod(method, dyn) {
    this.method = method;
    this.dyn = dyn;
  }

  function defineSetter(methodObj, key) {
    var funcName = "set" + key.charAt(0).toUpperCase() + key.substring(1);
    methodObj[funcName] = function(value) {
      this.dyn.set(key, value);
      return this;
    }
  }

  function invoke(self) {
    var promise = $.Deferred();
    var req = new XMLHttpRequest();
    req.addEventListener("load", function() {
      if (req.status === 200) {
        promise.resolve(JSON.parse(req.responseText));
      }
      else {
        promise.reject(new Error("status " + req.status));
      }
    });
    req.addEventListener("error", function(e) {
      promise.reject(e);
    });
    req.open(self.method, self.dyn.uri());
    req.send(self.dyn.body());
    return promise;
  }

  HttpMethod.prototype = {
    invoke: function() {
      return invoke(this);
    }
  }

  ////////////// HttpMethodBuilder

  function HttpMethodBuilder() {
    this.method = GET;
    this.baseUrl = "/";
    this.path = [];
    this.query = [];
    this.keys = [];
  }

  HttpMethodBuilder.prototype = {
    setMethod: function(method) {
      this.method = method;
      return this;
    },
    setBaseUrl: function(baseUrl) {
      this.baseUrl = baseUrl;
      return this;
    },
    addPathComponent: function(value) {
      this.path.push({ value: value });
      return this;
    },
    addPathParameter: function(key) {
      this.path.push({ key: key });
      this.keys.push(key);
      return this;
    },
    addQueryPair: function(lhs, value) {
      this.query.push({ lhs: lhs, value: value });
      return this;
    },
    addQueryParameter: function(lhs, key) {
      this.query.push({ lhs: lhs, key: key });
      this.keys.push(key || lhs);
      return this;
    },
    build: function() {
      // Snapshot builder state.
      var builder = this;
      var method = builder.method;
      var baseUrl = builder.baseUrl;
      var path = builder.path.slice();
      var query = builder.query.slice();
      var keys = builder.keys;

      var result = new HttpMethod(method, new HttpDyn(method, baseUrl, path, query));
      for (var i = 0; i < keys.length; ++i) {
        defineSetter(result, keys[i]);
      }
      return result;
    }
  }

  // TEMP, for test
  new HttpMethodBuilder()
    .setMethod("GET")     // the default
    .setBaseUrl("/")      // the default
    .addPathComponent("ping")
    .addPathParameter("count")
    .addPathComponent("/a/b")
    .addPathParameter("id")
    .addQueryParameter("p")
    .addQueryParameter("_", "salt")
    .addQueryPair("const", 12345)
    .build()
    .setCount(111)
    .setId("Mort")
    .setP(0)
    .setSalt("xxxxxxxxxxxxxx")
    .invoke()
    .then(function(result) {
      console.log('result', result);
    })
    .catch(function(error) {
      console.log('error', error);
    });

  return Method;
});
