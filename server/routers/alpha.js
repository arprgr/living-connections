/* alpha.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  const sessionLogic = require("../biz/sessions");
  const actionLogic = require("../biz/actions");

  function ActionHandler(req, res) {
    var self = this;
    self.request = req;
    self.response = res;
  }

  function logInIfRequested(self) {
    return new Promise(function(resolve, reject) {
      var email = self.request.query.email;
      if (email) {
        console.log("log in", email);
        resolve(sessionLogic.logInWithEmail(email, self));
      }
      else {
        resolve(self);
      }
    });
  }

  function sendSessionCookie(self) {
    self.response.cookie("s", self.session.externalId, {
      maxAge: 900000,
      path: "/",
    });
  }

  function getSessionCookie(self) {
    return self.request.cookies.s;
  }

  function resolveSession(self) {
    return new Promise(function(resolve, reject) {
      var sessionId;
      if (self.session) {
        sendSessionCookie(self);
        resolve(self);
      }
      else if (sessionId = getSessionCookie(self)) {
        resolve(sessionLogic.restoreSession(sessionId, self));
      }
      else {
        resolve(self);
      }
    });
  }

  function retrieveUserName(self) {
    return sessionLogic.lookupUserName(self.session, self);
  }

  function retrieveActionItems(self) {
    return actionLogic.compileActions(self.userId, self);
  }

  function runActionHandler() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var steps = [
        logInIfRequested,
        resolveSession,
        retrieveUserName,
        retrieveActionItems
      ];

      (function next() {
        var f = steps.shift();
        if (f) {
          f.call(null, self)
            .then(next)
            .catch(reject);
        }
        else {
          resolve(self);
        }
      })();
    });
  }

  function runActionHandlerAndRespond() {
    var self = this;
    self.run()
      .then(function() {
        self.response.json({
          userName: self.userName,
          actionItems: self.actionItems
        });
      })
      .catch(function(error) {
        self.response.json({ error: String(error) });
      }
    );
  }

  ActionHandler.prototype = {
    run: runActionHandler,
    runAndRespond: runActionHandlerAndRespond
  };

  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res) {
    new ActionHandler(req, res).runAndRespond();
  });
  return router;
})();
