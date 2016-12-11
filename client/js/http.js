// http.js

define([ "jquery" ], function($) {

  var GET = "GET";
  var POST = "POST";
  var PUT = "PUT";

  ////////////// HttpMethod

  function HttpMethod(state) {
    $.extend(this, state);
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

  function executeHttpMethod(self) {
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
    req.open(self.method, self.uri());
    switch (self.method) {
    case POST:
    case PUT:
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    req.send(self.body());
    return promise;
  }

  HttpMethod.prototype = {
    uri: function() {
      return buildUri(this);
    },
    body: function() {
      return buildBody(this);
    },
    execute: function() {
      return executeHttpMethod(this);
    }
  }

  ////////////// HttpMethodBuilder

  function HttpMethodBuilder() {
    this.method = GET;
    this.baseUrl = "/";
    this.path = [];
    this.query = [];
    this.setters = {};
  }

  function setterFunc(key) {
    return function(value) {
      this.params[key] = value;
      return this;
    }
  }

  function addSetter(builder, key) {
    var funcName = "set" + key.charAt(0).toUpperCase() + key.substring(1);
    builder.setters[funcName] = setterFunc(key);
  }

  function buildHttpMethod(builder) {
    // Snapshot builder state.
    var builderState = {
      method: builder.method,
      baseUrl: builder.baseUrl,
      path: builder.path.slice(),
      query: builder.query.slice()
    }
    // Generate the constructor.
    var classFunc = function() {
      $.extend(this, builderState);
      this.params = {};
    }
    classFunc.prototype = $.extend({}, HttpMethod.prototype, builder.setters);
    return classFunc;
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
      addSetter(this, key);
      return this;
    },
    addQueryPair: function(lhs, value) {
      this.query.push({ lhs: lhs, value: value });
      return this;
    },
    addQueryParameter: function(lhs, key) {
      this.query.push({ lhs: lhs, key: key || lhs });
      addSetter(this, key || lhs);
      return this;
    },
    build: function() {
      return buildHttpMethod(this);
    }
  }

  HttpMethod.GET = GET;
  HttpMethod.POST = POST;
  HttpMethod.PUT = PUT;
  HttpMethod.Builder = HttpMethodBuilder;

  return HttpMethod;
});
