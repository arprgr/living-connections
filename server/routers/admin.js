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
    if (!req.user || req.user.level > 0) {
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

  return router;
})();
