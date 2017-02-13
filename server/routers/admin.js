/* routers/admin.js */

module.exports = (function() {
  const Promise = require("promise");
  const express = require("express");
  const actionsLogic = require("../biz/actions");
  const registrationLogic = require("../biz/registration");
  const models = require("../models/index");
  const router = express.Router();

  // All of these functions require admin permissions.
  router.use(function(req, res, next) {
    if (!req.isAdmin) {
      res.jsonError({ status: 401 });
    }
    else {
      next();
    }
  });

  router.post("/register", function(req, res) {
    res.jsonResultOf(registrationLogic.register(req.body, {}));
  });

  router.post("/actions/:userId", function(req, res) {
    res.jsonResultOf(
      models.User.findById(req.params.userId)
      .then(function(user) {
        return actionsLogic.compileActions(user, {})
      }));
  });

  router.post("/connect/:userId/:peerId", function(req, res) {
    res.jsonResultOf(models.Connection.findOrCreate({
      where: { UserId: req.params.userId, peerId: req.params.peerId }
    }));
  });

  // Retrieve all current sessions for a user.
  router.get("/users/:id/sessions", function(req, res) {
    res.jsonResultOf(models.Session.findByUserId(req.params.id));
  });

  // Wipe it all!
  router.get("/wipe", function(req, res) {
    res.jsonResultOf(new Promise(function(resolve) {
      resolve(models.User.destroyAll()
        .then(function() {
          return models.EmailSessionSeed.destroyAll();
        })
        .then(function() {
          return models.EmailProfile.destroyAll();
        })
        .then(function() {
          return models.Connection.destroyAll();
        })
        .then(function() {
          return models.FacebookProfile.destroyAll();
        })
        .then(function() {
          return models.Message.destroyAll();
        })
      );
    }));
  });

  return router;
})();
