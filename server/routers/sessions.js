/* sessions.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.Session.create({
      externalId: req.body.external_id,
      UserId: req.body.user_id
    }).then(function(asset) {
      res.json(asset);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Retrieve (by external id)
  router.get("/:external_id", function(req, res) {
    models.Session.findByExternalId(req.params.external_id)
    .then(function(sessions) {
      res.json(sessions);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Update
  router.put("/:external_id", function(req, res) {
    models.Session.findByExternalId(req.params.external_id)
    .then(function(session) {
      if (session) {
        session.updateAttributes({});
        res.json(session);
      }
      else {
        res.json({});
      }
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(models.Session.destroy({ where: {} }));
  });

  // Delete
  router.delete("/:external_id", function(req, res) {
    res.jsonResultOf(models.Session.destroyByExternalId(req.params.external_id));
  });

  return router;
})();
