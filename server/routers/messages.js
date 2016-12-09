/* messages.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.Message.create({
      type: req.body.type,
      status: req.body.status,
      fromUserId: req.body.fromUserId,
      toUserId: req.body.toUserId,
      assetId: req.body.assetId
    }).then(function(asset) {
      res.json(asset);
    }).catch(function(error) {
      res.json({ error: error });
    });
  });

  // Retrieve (by id)
  router.get("/:id", function(req, res) {
    models.Message.find({
      where: {
        id: req.params.id
      }
    }).then(function(assets) {
      res.json(assets);
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
          type: req.body.type,
          status: req.body.status,
          fromUserId: req.body.fromUserId,
          toUserId: req.body.toUserId,
          assetId: req.body.assetId
        })
        res.json(user);
      }
      else {
        res.json(null);
      }
    });
  });

  return router;
})();

