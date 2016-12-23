/* users.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // All of these functions require at least a valid user.
  router.use(function(req, res, next) {
    if (!req.user) {
      res.jsonError({ status: 401 });
    }
    else {
      next();
    }
  });

  // Create
  router.post("/", function(req, res) {
    if (req.user.level > 0) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(models.User.create({
        level: req.body.level,
        name: req.body.name,
        assetId: req.body.assetId
      }))
    }
  });

  // Retrieve by ID
  router.get("/:id", function(req, res) {
    var userId = req.params.id;
    if (userId == "-") {
      userId = req.user.id;
    }
    if (req.user.level > 0 && req.user.id != userId) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(models.User.findById(userId));
    }
  });

  // Update
  router.put("/:id", function(req, res) {
    var userId = req.params.id;
    if (userId == "-") {
      userId = req.user.id;
    }
    if (req.user.level > 0 && req.user.id != userId) {
      res.jsonError({ status: 401 });
    }
    else {
      models.User.findById(userId)
      .then(function(user) {
        res.jsonResultOf(user.updateAttributes(req.body));
      })
      .catch(function(error) {
        res.jsonError(error);
      });
    }
  });

  // Retrieve all current sessions
  router.get("/:id/sessions", function(req, res) {
    if (req.user.level > 0) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(models.Session.findByUserId(req.params.id));
    }
  });

  // Delete all.
  router.delete("/", function(req, res) {
    if (req.user.level > 0) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(models.User.destroy({ where: {} }));
    }
  });

  return router;
})();
