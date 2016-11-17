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

  function executeSequence(steps, catcher) {
    (function next() {
      var f = steps.shift();
      if (f) {
        f().then(next).catch(catcher);
      }
    })();
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
    return new Promise(function(resolve, reject) {
      models.EmailProfile.findByEmail(email)
      .then(function(emailProfile) {
        if (emailProfile) {
          self.userId = emailProfile.UserId;
          resolve(self);
        }
        else {
          reject("Login failed");
        }
      })
      .catch(function(error) {
        reject(error);
      })
    });
  }

  function resolveSession(self) {
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

  function retrieveUserName(self) {
    if (!self.session) {
      return alreadyDone();
    }
    else {
      return models.User.findById(self.session.UserId)
      .then(function(user) {
        self.userName = user.name;
      })
    }
  }

  function retrieveActionItems(self) {
    self.actionItems = [];
    return alreadyDone();
  }

  function sendJson(self) {
    var payload = {};
    if (self.userName) {
      payload.userName = self.userName;
      payload.actionItems = self.actionItems;
    }
    self.response.json(payload);
    return alreadyDone();
  }

  ActionHandler.prototype = {

    run: function() {
      var self = this;
      executeSequence([
        function() {
          logInIfRequested(self);
        },
        function() {
          resolveSession(self);
        },
        function() {
          retrieveUserName(self);
        },
        function() {
          retrieveActionItems(self);
        },
        function() {
          sendJson(self);
        }
      ],
        function() {
          self.response.json({ error: error });
        }
      );
    }
  };

  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res) {
    new ActionHandler(req, res).run();
  });
  return router;
})();

