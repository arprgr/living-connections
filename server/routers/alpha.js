/* routers/alpha.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const Promise = require("promise");
  const auth = require("../auth");
  const actionLogic = require("../biz/actions");

  function sendSessionCookie(res, sessionId) {
    res.cookie("s", sessionId, {
      maxAge: 2147483647,
      path: "/",
    });
  }

  function logIn(req, res) {
    var email = req.query.email;
    if (email) {
      req.session = null;
      return auth.logInWithEmail(email, req)
      .then(function(session) {
        if (session) {
          sendSessionCookie(res, session.externalId);
        }
        return session;
      })
    }
    else {
      return Promise.resolve(req.session);
    }
  }

  router.get("/", function(req, res) {

    var result = {};

    logIn(req, res)
    .then(function() {
      if (req.session && req.user) {
        return actionLogic.compileActions(req.user, result);
      }
    })
    .then(function() {
      res.json(result);
    })
    .catch(function(error) {
      if (error.stack) {
        console.error(error.stack);
      }
      res.json({ msg: String(error) });
    })
  });

  return router;
})();
