/* emailprofiles.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.EmailProfile.create({
      email: req.body.email,
      UserId: req.body.user_id
    }).then(function(asset) {
      res.json(asset);
    });
  });

  // Retrieve (by id)
  router.get("/:id", function(req, res) {
    models.EmailProfile.findById(req.params.id)
    .then(function(emails) {
      res.json(emails);
    });
  });

  // Retrieve (by email)
  router.get("/email/:email", function(req, res) {
    models.EmailProfile.findByEmail(req.params.email)
    .then(function(emails) {
      res.json(emails);
    });
  });

  return router;
})();
