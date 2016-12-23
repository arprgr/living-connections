/* assets.js */

const Asset = require("../models/index").Asset;
const videoStoreConnector = require("../connectors/videostore");

var router = require("express").Router();

// All functions require a valid user.
router.use(function(req, res, next) {
  if (req.user) {
    next();
  }
  else {
    res.jsonError({ status: 401 });
  }
});

function createAsset(creatorId, mime, key, url) {
  return Asset.create({
    creatorId: creatorId,
    mime: mime,
    key: key,
    url: url
  })
}

function upload(req, res) {
  return videoStoreConnector.saveVideo(req.body)
  .then(function(info) {
    return createAsset(req.user.id, req.get("Content-type"), info.key, info.url);
  })
}

function handleAdminCreate(req, res) {
  return createAsset(req.user.id, req.body.mime, req.body.key, req.body.url);
}

// Create
router.post("/", function(req, res, next) {
  res.jsonResultOf(req.is("video/*") ? upload(req, res) : adminCreate(req, res));
});

// Retrieve (by id)
router.get("/:id", function(req, res, next) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.findById(req.params.id));
  }
});

// Delete all.
router.delete("/", function(req, res) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.destroy({ where: {} }));
  }
});

// Delete one.
router.delete("/:id", function(req, res, next) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.destroyById(req.params.id));
  }
});

module.exports = router;
