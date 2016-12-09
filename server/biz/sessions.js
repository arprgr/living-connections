/* biz/sessions.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  const email = require("../util/email");
  
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

  function findEmailProfile(emailAddress) {
    return models.EmailProfile.findByEmail(emailAddress);
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
  function logInWithEmail(emailAddress, target) {
    return new Promise(function(resolve, reject) {

      findEmailProfile(emailAddress)
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
          /***
          email.send({
            to: emailAddress,
            subject: "Living Connections",
            text: "\n\nTesting, testing.\n\n"
          })
          .then(function(what) {
            console.log(what);
          })
          .catch(function(what) {
            console.log(what);
          });
          reject("Your invitation has been sent. Check your email.");
          ***/
          reject("Login failed");
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
  function lookupUser(session, target) {
    if (!session) {
      return Promise.resolve(target);
    }
    var userId = session.UserId;
    return findUserForSession(session)
    .then(function(user) {
      if (user) {
        console.log("retrieved user", user.name);
        target.user = user;
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
    lookupUser: lookupUser
  }
})();
