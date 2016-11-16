/* action.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  
  function yearsFromNow(nyears) {
    var now = Date.now();
    return new Date(now.getYear() + nyears, now.getMonth(), now.getDate());
  }

  const DIGITS = "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "0123456789";

  function randomDigits(n) {
    var result = "";
    for (var i = 0; i < n; ++i) {
      result += DIGITS[Math.floor(Math.random() * DIGITS.length)];
    }
    return result;
  }

  function alreadyDone() {
    return Promise.resolve(null);
  }

  function ActionHandler(req, res) {
    var self = this;
    self.request = req;
    self.response = res;
  }

  function logInIfRequested(self) {
    var email = self.request.query.email;
    if (!email) {
      return alreadyDone();
    }
    console.log("log in", email);
    return models.EmailProfile.findByEmail(email)
    .then(function(emailProfile) {
      if (emailProfile) {
        self.userId = emailProfile.UserId;
      }
      else {
        self.sendError("Login failed");
      }
    });
  }

  function resolveSession() {
    var self = this;
    var sessionId = self.request.cookies.s;
    if (sessionId) {
      console.log("findSession", sessionId);
      return models.Session.findByExternalId(sessionId)
      .then(function(session) {
        self.session = session;
      })
    }
    else if (self.userId) {
      var externalId = randomDigits(4) + "-" + randomDigits(6) + "-" + randomDigits(6);
      console.log("createSession", externalId);
      return models.Session.create({
        externalId: externalId,
        UserId: self.userId
      })
      .then(function(session) {
        self.session = session;
        self.response.cookie("s", session.externalId, {
          expires: yearsFromNow(5),
          path: "/",
        });
      });
    }
    else {
      return alreadyDone();
    }
  }

  function retrieveUserName() {
    var self = this;
    if (!self.session) {
      return alreadyDone();
    }
    else {
      return models.User.findById(self.session.UserId)
      .then(function(user) {
        self.userName = user.name;
      })
      .catch(reportError);
    }
  }

  function retrieveActionItems() {
    var self = this;
    self.actionItems = [];
    return alreadyDone();
  }

  function sendJson() {
    var self = this;
    var payload = {};
    if (self.userName) {
      payload.userName = self.userName;
      payload.actionItems = self.actionItems;
    }
    self.response.json(payload);
  }

  function sendError(error) {
    var self = this;
    self.response.json({ error: error });
  }

  ActionHandler.prototype = {

    sendError: sendError,

    run: function() {
      var self = this;
      logInIfRequested(self)
      .then(resolveSession.bind(self))
      .then(retrieveUserName.bind(self))
      .then(retrieveActionItems.bind(self))
      .then(sendJson.bind(self))
      .catch(sendError.bind(self));
    }
  };

  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res) {
    new ActionHandler(req, res).run();
  });
  return router;
})();

