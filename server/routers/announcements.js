/* announcements.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // For admin access only.
  router.use(function(req, res, next) {
    if (!req.user || req.user.level !== 0) {
      next({ status: 401 });
    }
    else {
      next();
    }
  });

  function parseDate(str) {
    return str ? new Date(str) : new Date();
  }

  // Create
  router.post("/", function(req, res, next) {
    models.Announcement.create({
      startDate: parseDate(req.body.startDate),
      endDate: parseDate(req.body.endDate),
      creatorId: req.user.id,
      assetId: req.body.assetId
    }).then(function(announcement) {
      res.json(announcement);
    }).catch(next);
  });

  // Retrieve by ID
  router.get("/:id", function(req, res, next) {
    models.Announcement.findById(req.params.id)
    then(function(announcement) {
      res.json(announcement);
    }).catch(next);
  });

  // Retrieve Announcements by date
  router.get("/", function(req, res, next) {
    models.Announcement.findByDate(parseDate(req.query.date))
    .then(function(announcements) {
      res.json(announcements);
    }).catch(next);
  });

  // Update
  router.put("/:id", function(req, res, next) {
    models.Announcement.find({
      where: {
        id: req.params.id
      }
    }).then(function(user) {
      if (user) {
        user.updateAttributes({
          startDate: parseDate(req.body.startDate),
          endDate: parseDate(req.body.endDate),
          assetId: req.body.assetId
        })
        res.json(user);
      }
      else {
        res.json(null);
      }
    }).catch(next);
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(models.Announcement.destroy({ where: {} }));
  });

  return router;
})();
