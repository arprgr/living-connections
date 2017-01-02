/* announcements.js */

const Announcement = require("../models/index").Announcement;

var router = require("express").Router();

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
router.post("/", function(req, res) {
  res.jsonResultOf(Announcement.create({
    startDate: parseDate(req.body.startDate),
    endDate: parseDate(req.body.endDate),
    creatorId: req.user.id,
    assetId: req.body.assetId
  }));
});

// Retrieve by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(Announcement.findById(req.params.id));
});

// Retrieve Announcements by date
router.get("/", function(req, res) {
  res.jsonResultOf(Announcement.findByDate(parseDate(req.query.date)));
});

// Update
router.put("/:id", function(req, res) {
  Announcement.findById(req.params.id)
  .then(function(announcement) {
    res.jsonResultOf(announcement.updateAttributes({
      startDate: parseDate(req.body.startDate),
      endDate: parseDate(req.body.endDate),
      assetId: req.body.assetId
    }));
  }).catch(function(error) {
    res.jsonError(error);
  });
});

// Delete one.
router.delete("/:id", function(req, res) {
  res.jsonResultOf(Announcement.destroyById(req.params.id));
});

// Delete all.
router.delete("/", function(req, res) {
  res.jsonResultOf(Announcement.destroyAll());
});

module.exports = router;
