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
        key: info.id
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

  // Delete
  router.delete("/:id", function(req, res, next) {
    models.Asset.destroyById(req.params.id)
    .then(function() {
      res.json({});
    }).catch(next);
  });

  return router;
})();
