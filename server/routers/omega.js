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
      var sessionId = self.request.params.sid;
      console.log("remove session id", sessionId);
      resolve(models.Session.destroyByExternalId(sessionId));
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
  router.get("/:sid", function(req, res) {
    new LogoutHandler(req, res).runAndRespond();
  });
  return router;
})();
