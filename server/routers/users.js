/* users.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.User.create({
      level: req.body.level,
      name: req.body.name
    }).then(function(user) {
      res.json(user);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Retrieve by ID
  router.get("/:id", function(req, res) {
    models.User.findById(req.params.id)
    then(function(user) {
      res.json(user);
    });
  });

  // Update
  router.put("/:id", function(req, res) {
    models.User.find({
      where: {
        id: req.params.id
      }
    }).then(function(user) {
      if (user) {
        user.updateAttributes({
          level: req.body.level,
          name: req.body.name
        })
        res.json(user);
      }
      else {
        res.json(null);
      }
    });
  });

  // Retrieve email profile - TODO: merge this into retrieve
  router.get("/:user_id/emailprofile", function(req, res) {
    models.EmailProfile.findAll({
      where: {
        UserId: req.params.user_id
      }
    }).then(function(assets) {
      res.json(assets);
    });
  });

  // Retrieve all current sessions
  router.get("/:user_id/sessions", function(req, res) {
    models.Session.findByUserId(req.params.user_id)
    .then(function(sessions) {
      res.json(sessions);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Retrieve all assets. TODO: add paging.
  router.get("/:user_id/assets", function(req, res) {
    models.Asset.findAll({
      where: {
        UserId: req.params.user_id
      }
    }).then(function(assets) {
      res.json(assets);
    });
  });

  return router;
})();
