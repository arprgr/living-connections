/* biz/sessions.js */

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

  function generateSessionId() {
    return randomDigits(8) + "-" + randomDigits(12) + "-" + randomDigits(12);
  }

  function findEmailProfile(email) {
    return models.EmailProfile.findByEmail(email);
  }

  function createNewSession(userId) {
    return models.Session.create({
      externalId: generateSessionId(),
      UserId: userId
    });
  }

  function findSession(externalId) {
    return models.Session.findByExternalId(externalId);
  }

  function findUserForSession(session) {
    return models.User.findById(session.UserId);
  }

  // Exported
  function logInWithEmail(email, target) {
    return new Promise(function(resolve, reject) {

      findEmailProfile(email)
      .then(function(emailProfile) {
        if (emailProfile) {
          target.emailProfile = emailProfile;
          target.userId = emailProfile.UserId;

          createNewSession(emailProfile.UserId)
          .then(function(session) {
            target.session = session;
            resolve(target);
          })
          .catch(reject);
        }
        else {
          reject("Email not registered.");
        }
      })
      .catch(reject);
    });
  }

  // Exported
  function restoreSession(externalId, target) {
    return findSession(externalId)
    .then(function(session) {
      console.log("found session", session.id);
      target.session = session;
      target.userId = session.UserId;
    })
  }

  // Exported
  function lookupUserName(session, target) {
    if (!session) {
      return Promise.resolve(target);
    }
    var userId = session.UserId;
    return findUserForSession(session)
    .then(function(user) {
      if (user) {
        console.log("retrieved user name", user.name);
        target.userName = user.name;
      }
      else {
        console.log("user not found!", userId);
      }
    })
  }

  return {
    logInWithEmail: logInWithEmail,
    restoreSession: restoreSession,
    lookupUserName: lookupUserName
  }
})();
