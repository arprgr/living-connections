/* sessions.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/sessions", function(req, res) {
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
  router.get("/session/:external_id", function(req, res) {
    models.Session.findByExternalId(req.params.external_id)
    .then(function(sessions) {
      res.json(sessions);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Update
  router.put("/session/:external_id", function(req, res) {
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

  // Delete
  router.delete("/session/:external_id", function(req, res) {
    models.Session.destroyByExternalId(req.params.external_id)
    .then(function() {
      res.json({});
    }).catch(function(error) {
      res.json(error);
    });
  });

  return router;
})();
