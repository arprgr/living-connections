/* routers/alpha.js */

module.exports = (function() {
  const Promise = require("promise");
  const auth = require("../auth");
  const actionLogic = require("../biz/actions");

  function AlphaHandler(req, res) {
    var self = this;
    self.request = req;
    self.response = res;
  }

  function sendSessionCookie(self) {
    self.response.cookie("s", self.request.session.externalId, {
      maxAge: 2147483647,
      path: "/",
    });
  }

  function logInIfRequested(self) {
    var email = self.request.query.email;
    if (email) {
      self.request.user = null;
      self.request.session = null;
      return auth.logInWithEmail(email, self.request)
      .then(function() {
        if (self.request.session) {
          sendSessionCookie(self);
        }
      })
    }
    else {
      return Promise.resolve();
    }
  }

  function runAlphaHandler(self) {
    return logInIfRequested(self)
    .then(function() {
      var user = self.request.user;
      return user ? actionLogic.compileActions(user, self) : self;
    });
  }

  AlphaHandler.prototype = {
    run: function() {
      return runAlphaHandler(this);
    }
  }

  // The express stuff.
  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res, next) {
    new AlphaHandler(req, res).run()
    .then(function(actionHandler) {
      res.json({
        userName: req.user && req.user.name,
        actionItems: actionHandler.actionItems
      });
    })
    .catch(next);
  });
  return router;
})();
