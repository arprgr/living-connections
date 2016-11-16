/* assets.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.Asset.create({
      key: req.body.key,
      size: req.body.size,
      mime: req.body.mime,
      UserId: req.body.user_id
    }).then(function(asset) {
      res.json(asset);
    });
  });

  // Retrieve (by id)
  router.get("/:id", function(req, res) {
    models.Asset.find({
      where: {
        id: req.params.id
      }
    }).then(function(assets) {
      res.json(assets);
    });
  });

  return router;
})();

