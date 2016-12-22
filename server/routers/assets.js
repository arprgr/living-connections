/* assets.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");
  const Promise = require("promise");
  const videoStoreConnector = require("../connectors/videostore");

  // All functions require a valid user.
  router.use(function(req, res, next) {
    req.user ? next() : next({ status: 401 });
  });

  // Create
  router.post("/", function(req, res, next) {
    ( req.is("video/*")
        ? videoStoreConnector.saveVideo(req.body)
        : Promise.resolve({ id: req.body.key })
    ).then(function(info) {
      return models.Asset.create({
        creatorId: req.user.id,
        mime: req.get("Content-type"),
        key: info.id,
        url: info.url
      })
    }).then(function(model) {
      res.json(model);
    }).catch(next);
  });

  // Retrieve (by id)
  router.get("/:id", function(req, res, next) {
    models.Asset.findById(req.params.id)
    .then(function(assets) {
      res.json(assets);
    }).catch(next);
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(models.Asset.destroy({ where: {} }));
  });

  // Delete
  router.delete("/:id", function(req, res, next) {
    res.jsonResultOf(models.Asset.destroyById(req.params.id));
  });

  return router;
})();
