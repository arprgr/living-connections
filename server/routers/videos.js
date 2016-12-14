/* videos.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");
  const videoStoreConnector = require("../connectors/videostore");

  function createVideoModel(creatorId, externalId, storageSystemId) {
    return models.Video.create({
      creatorId: userId,
      externalId: externalId,
      storageSystemId: storageSystemId
    });
  }

  function saveVideoAndCreateModel(user, buffer) {
    return videoStoreConnector.saveVideo(buffer)
    .then(function(videoStoreInfo) {
      return createVideoModel(user.id, videoStoreInfo.id, videoStoreInfo.storageSystemId);
    });
  }

  // Create
  router.post("/", function(req, res) {
    if (!req.user) {
      throw { status: 401 };
    }
    ( req.is("video/*")
        ? saveVideoAndCreateModel(req.user, req.body)
        : createVideoModel(req.user.id, req.body.externalId, req.body.storageSystemId)
    ).then(function(video) {
      res.json(video);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Retrieve
  router.get("/:id", function(req, res) {
    models.Video.findById(req.params.id)
    .then(function(videos) {
      res.json(videos);
    }).catch(function(error) {
      res.json(error);
    });
  });

  // Delete
  router.delete("/:id", function(req, res) {
    models.Video.destroyById(req.params.id)
    .then(function() {
      res.json({});
    }).catch(function(error) {
      res.json(error);
    });
  });

  return router;
})();
