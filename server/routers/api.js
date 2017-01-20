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
  try {
    if (str) return new Date(str);
  }
  catch (e) {
  }
}

// Create
router.post("/", function(req, res) {
  res.jsonResultOf(Announcement.create({
    startDate: parseDate(req.body.startDate) || new Date(),
    endDate: parseDate(req.body.endDate) || new Date(new Date().getTime() + 30*24*60*60*1000),
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
  res.jsonResultOf(Announcement.findById(req.params.id)
    .then(function(announcement) {
      var attrs = {};
      if ("startDate" in req.body) {
        attrs.startDate = new Date(req.body.startDate);
      }
      if ("endDate" in req.body) {
        attrs.endDate = new Date(req.body.endDate);
      }
      if ("assetId" in req.body) {
        attrs.assetId = req.body.assetId;
      }
      return announcement.updateAttributes(attrs);
    })
  );
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
