/* messages.js */

const Message = require("../models/index").Message;

var router = require("express").Router();

// All of these functions require at least some valid user.
router.use(function(req, res, next) {
  if (req.user) {
    next();
  }
  else {
    res.jsonError({ status: 401 });
  }
});

// Create
router.post("/", function(req, res) {
  res.jsonResultOf(Message.create({
    type: req.body.type,
    status: req.body.status,
    fromUserId: req.user.id,
    toUserId: req.body.toUserId,
    assetId: req.body.assetId
  }));
});

// Retrieve (by id)
router.get("/:id", function(req, res) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Message.findById(req.params.id));
  }
});

// Update
router.put("/:id", function(req, res) {
  Message.findById(req.params.id)
  .then(function(message) {
    if (req.user.level > 0 && req.user.id != message.fromUserId) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(message.updateAttributes({
        type: req.body.type,
        status: req.body.status,
        toUserId: req.body.toUserId,
        assetId: req.body.assetId
      }));
    }
  })
  .catch(function(err) {
    res.jsonError({ status: 404 });
  });
});

// Delete one.
router.delete("/:id", function(req, res) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Message.destroyById(req.params.id));
  }
});

// Delete all.
router.delete("/", function(req, res) {
  if (req.user.level > 0) {
    res.jsonError({ status: 401 });
  }
  else {
    res.jsonResultOf(Message.destroyAll());
  }
});

module.exports = router;
