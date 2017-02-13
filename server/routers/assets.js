/* assets.js */

const Asset = require("../models/index").Asset;
const videoStoreConnector = require("../connectors/videostore");

var router = require("express").Router();

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

function adminCreate(req, res) {
  return createAsset(req.user.id, req.body.mime, req.body.key, req.body.url);
}

// Create
router.post("/", function(req, res) {
  if (!req.user) {
    res.jsonError({ status: 401 });
  }
  res.jsonResultOf(req.is("video/*") ? upload(req, res) : adminCreate(req, res));
});

// Retrieve (by id)
router.get("/:id", function(req, res) {
  if (!req.isAdmin) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.findById(req.params.id));
  }
});

// Delete all.
router.delete("/", function(req, res) {
  if (!req.isAdmin) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.destroy({ where: {} }));
  }
});

// Delete one.
router.delete("/:id", function(req, res) {
  if (!req.isAdmin) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Asset.destroyById(req.params.id));
  }
});

module.exports = router;
