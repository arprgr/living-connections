/* routers/admin.js */

module.exports = (function() {
  const Promise = require("promise");
  const express = require("express");
  const actionsLogic = require("../biz/actions");
  const registrationLogic = require("../biz/registration");
  const models = require("../models/index");
  const router = express.Router();

  router.post("/register", function(req, res) {
    registrationLogic.register(req.body, {})
    .then(function(target) {
      res.json(target);
    })
    .catch(function(error) {
      res.json({ error: String(error) });
    });
  });

  router.post("/actions/:userId", function(req, res) {
    models.User.findById(req.params.userId)
    .then(function(user) {
      return actionsLogic.compileActions(user, {})
    })
    .then(function(target) {
      res.json(target);
    })
    .catch(function(error) {
      res.json({ error: String(error) });
    });
  });

  router.post("/connect/:userId/:peerId", function(req, res) {
    models.Connection.findOrCreate({
      where: { UserId: req.params.userId, peerId: req.params.peerId }
    })
    .then(function(info) {
      res.json(info);
    })
    .catch(function(error) {
      res.json({ error: String(error) });
    });
  });

  return router;
})();
