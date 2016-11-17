/* action.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  
  const DIGITS = "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "0123456789";

  function randomDigits(len) {
    var result = "";
    for (var i = 0; i < len; ++i) {
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
            self.newUserId = emailProfile.UserId;
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
        models.Session.findByExternalId(sessionId)
        .then(function(session) {
          console.log("found session", session.id);
          self.session = session;
          resolve(self);
        })
        .catch(reject);
      }
      else if (typeof self.newUserId === "number") {
        var externalId = randomDigits(8) + "-" + randomDigits(12) + "-" + randomDigits(12);
        console.log("createSession", externalId);
        models.Session.create({
          externalId: externalId,
          UserId: self.newUserId
        })
        .then(function(session) {
          try {
            console.log("created session", session.id);
            self.session = session;
            self.response.cookie("s", session.externalId, {
              maxAge: 900000,
              path: "/",
            });
            resolve(self);
          }
          catch (e) {
            reject(e);
          }
        })
        .catch(reject);
      }
      else {
        resolve(self);
      }
    });
  }

  function retrieveUserName(self) {
    console.log("retrieveUserName");
    return new Promise(function(resolve, reject) {
      if (!self.session) {
        console.log("no session");
        resolve(self);
      }
      else {
        var userId = self.session.UserId;
        console.log("retrieving user name for", userId);
        models.User.findById(userId)
        .then(function(user) {
          console.log("retrieved user name", user.name);
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
