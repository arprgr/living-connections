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

  function ActionHandler(req, res) {
    var self = this;
    self.request = req;
    self.response = res;
  }

  function logInIfRequested(self) {
    return new Promise(function(resolve, reject) {
      var email = self.request.query.email;
      if (!email) {
        resolve(self);
      }
      else {
        console.log("log in", email);
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
        .catch(reject);
      }
    });
  }

  function resolveSession(self) {
    return new Promise(function(resolve, reject) {
      var sessionId = self.request.cookies.s;
      if (sessionId) {
        console.log("findSession", sessionId);
        return models.Session.findByExternalId(sessionId)
        .then(function(session) {
          self.session = session;
        })
      }
      else if (typeof self.userId === "number") {
        var externalId = randomDigits(4) + "-" + randomDigits(6) + "-" + randomDigits(6);
        console.log("createSession", externalId);
        models.Session.create({
          externalId: externalId,
          UserId: self.userId
        })
        .then(function(session) {
          self.session = session;
          self.response.cookie("s", session.externalId, {
            expires: yearsFromNow(5),
            path: "/",
          });
          resolve(self);
        })
        .catch(reject);
      }
      else {
        resolve(self);
      }
    });
  }

  function retrieveUserName(self) {
    return new Promise(function(resolve, reject) {
      if (!self.session) {
        resolve(self);
      }
      else {
        models.User.findById(self.session.UserId)
        .then(function(user) {
          self.userName = user.name;
          resolve(self);
        })
        .catch(reject);
      }
    });
  }

  function retrieveActionItems(self) {
    return new Promise(function(resolve, reject) {
      if (typeof self.userId === "number") {
        self.actionItems = [];
      }
      resolve();
    });
  }

  ActionHandler.prototype = {

    run: function() {
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
    },

    runAndRespond: function() {
      var self = this;
      self.run()
        .then(function() {
          self.response.json({
            userName: self.userName,
            actionItems: self.actionItems
          });
        })
        .catch(function(error) {
          self.response.json({ error: error });
        });
    }
  };

  const express = require("express");
  const router = express.Router();
  router.get("/", function(req, res) {
    new ActionHandler(req, res).runAndRespond();
  });
  return router;
})();

