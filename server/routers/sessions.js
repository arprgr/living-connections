/* sessions.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

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

  // Delete
  router.delete("/:external_id", function(req, res) {
    res.jsonResultOf(models.Session.destroyByExternalId(req.params.external_id));
  });

  return router;
})();
