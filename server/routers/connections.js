/* connections.js */

module.exports = (function() {
  const Connection = require("../models/index").Connection;
  const router = require("express").Router();

  // All of these functions require at least some valid user.
  router.use(function(req, res, next) {
    if (!req.user) {
      res.jsonError({ status: 401 });
    }
    else {
      next();
    }
  });

  // Get a connection.
  router.get("/:userId/:peerId", function(req, res) {
    res.jsonResultOf(
      Connection.findByUserAndPeerIds(req.params.userId, req.params.peerId)
      .then(function(connection) {
        if (!connection) {
          throw { status: 404 }
        }
        return connection;
      })
    );
  });

  // Create a connection.
  router.post("/", function(req, res) {
    res.jsonResultOf(Connection.builder()
      .user(req.user)
      .peerId(req.body.peerId) 
      .build());
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(Connection.destroy({ where: {} }));
  });

  return router;
})();

