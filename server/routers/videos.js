/* videos.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");
  const videoStoreConnector = require("../connectors/videostore");

  // Create
  router.post("/", function(req, res) {
    videoStoreConnector.saveVideo(req.body)
    .then(function(videoStoreInfo) {
      return models.Video.create({
        externalId: videoStoreInfo.id,
        storageSystemId: videoStoreInfo.storageSystemId
      });
    }).then(function(video) {
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
