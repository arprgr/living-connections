/* announcements.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.post("/", function(req, res) {
    models.Announcement.create({
      activationDate: new Date(req.body.activationDate),
      expiryDate: new Date(req.body.expiryDate),
      UserId: req.body.userId,
      AssetId: req.body.assetId
    }).then(function(user) {
      res.json(user);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Retrieve by ID
  router.get("/:id", function(req, res) {
    models.Announcement.findById(req.params.id)
    then(function(user) {
      res.json(user);
    });
  });

  // Retrieve all Announcements
  router.get("/", function(req, res) {
    models.Announcement.find()
    .then(function(announcements) {
      res.json(announcements);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Update
  router.put("/:id", function(req, res) {
    models.Announcement.find({
      where: {
        id: req.params.id
      }
    }).then(function(user) {
      if (user) {
        user.updateAttributes({
          activationDate: new Date(req.body.activationDate),
          expiryDate: new Date(req.body.expiryDate),
          AssetId: req.body.assetId
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
