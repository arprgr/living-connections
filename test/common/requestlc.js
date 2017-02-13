const expect = require("chai").expect;
const request = require("request");
const fs = require("fs");

const SERVER_URL = "http://localhost:4546";

const rootKey = fs.readFileSync("tmp/adminKey");

function makeRequest(method, uri) {

  var params = {
    method: method,
    url: SERVER_URL + uri,
    headers: {},
    followRedirect: false
  }

  var assertions = [];

  var postproc = function(response, body) { return body; };

  return {

    asRoot: function() {
      params.headers["X-Access-Key"] = rootKey;
      delete params.headers["X-Effective-User"];
      return this;
    },

    asUser: function(userId) {
      params.headers["X-Access-Key"] = rootKey;
      params.headers["X-Effective-User"] = userId;
      return this;
    },

    withData: function(data) {
      params.form = data;
      return this;
    },

    withCookie: function(name, value) {
      params.headers["Cookie"] = name + "=" + value;
      return this;
    },

    expectStatusCode: function(expectedStatusCode) {
      assertions.push(function(response) {
        expect(response.statusCode).to.equal(expectedStatusCode);
      });
      return this;
    },

    expectRedirect: function(expectedLocation) {
      assertions.push(function(response) {
        expect(response.statusCode).to.equal(302);
        expect(response.headers["location"]).to.equal(expectedLocation);
      });
      return this;
    },

    expectBody: function(expectedBody) {
      assertions.push(function(response, body) {
        expect(body).to.equal(expectedBody);
      });
      return this;
    },

    getJson: function() {
      postproc = function(response, body) {
        var obj = JSON.parse(body);
        expect(obj).to.exist;
        return obj;
      }
      return this;
    },

    getSetCookie: function(name) {
      postproc = function(response, body) {
        expect(response.headers["set-cookie"]).to.exist;
        expect(response.headers["set-cookie"].length).to.equal(1);
        var cookie = response.headers["set-cookie"][0];
        var m = cookie.match(/^s=([^;]+);/);
        expect(m).to.exist;
        return m[1];
      }
      return this;
    },

    go: function() {
      return new Promise(function(resolve, reject) {
        request(params, function(error, response, body) {
          if (error) {
            reject(error);
          }
          else {
            try {
              for (var i = 0; i < assertions.length; ++i) {
                assertions[i](response, body);
              }
            }
            catch (e) {
              if (response.statusCode == 500) {
                console.log(body);
              }
              throw e;
            }
            resolve(postproc(response, body));
          }
        })
      })
    }
  }
}

function wipe() {
  return makeRequest("GET", "/admin/wipe").asRoot().expectStatusCode(200).go();
}

module.exports = {
  describe: function(title, describer) {
    describe(title, function() {
      describer({
        makeRequest: makeRequest
      });

      afterEach(function(done) {
        wipe()
        .then(function() {
          return done();
        })
        .catch(done);
      });
    });
  }
}
