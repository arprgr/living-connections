/* connections_api.js */

const models = require("../models/index");
const Connection = models.Connection;

var router = require("express").Router();

// Create/update a connection.
router.put("/:userId/:peerId", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {

    var userId = req.params.userId;
    var peerId = req.params.peerId;

    if (!req.isAdmin && req.user.id != userId) {
      throw { status: 401 };
    }

    resolve(models.User.findById(peerId)
      .then(function(peer) {
        if (!peer) {
          throw { status: 404 };
        }
        return req.isAdmin ? models.User.findById(userId) : req.user;
      })
      .then(function(user) {
        if (!user) {
          throw { status: 404 };
        }
        return Connection.regrade(userId, peerId, req.body.grade);
      })
    );
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
