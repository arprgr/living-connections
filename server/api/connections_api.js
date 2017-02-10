/* connections_api.js */

const Connection = require("../models/index").Connection;

var router = require("express").Router();

// Create/update a connection.
router.put("/:userId/:peerId", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    // TODO: validate user IDs.
    // Only admin access... for now.
    if (!(req.user.level <= 0)) {
      throw { status: 401 };
    }
    return Connection.regrade(req.params.userId, req.params.peerId, req.body.grade)
  }));
});

// Retrieve a connection.
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

if (process.env.NODE_ENV == "test") {
  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(new Promise(function(resolve) {
      resolve(Connection.destroyAll());
    }))
  });
}

module.exports = router;
