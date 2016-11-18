/* omega.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  
  function LogoutHandler(req, res) {
    var self = this;
    self.request = req;
    self.response = res;
  }

  function runLogoutHandler() {
    var self = this;
    return new Promise(function(resolve, reject) {
      console.log("logging out");
      var sessionId = self.request.cookies.s;
      if (sessionId) {
        console.log("remove session id", sessionId);
        models.Session.destroyByExternalId(sessionId)
        .then(function() {
          resolve(self);
        })
        .catch(reject);
      }
      else {
        resolve(self);
      }
    });
  }

  function runLogoutHandlerAndRespond() {
    var self = this;
    self.run()
      .then(function() {
        self.response.json({});
      })
      .catch(function(error) {
        self.response.json({ error: String(error) });
      }
    );
  }

  LogoutHandler.prototype = {
    run: runLogoutHandler,
    runAndRespond: runLogoutHandlerAndRespond
  };

  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res) {
    new LogoutHandler(req, res).runAndRespond();
  });
  return router;
})();
