/* threads_api.js */

const models = require("../models/index");
const ApiValidator = require("./api_validator");

var router = require("express").Router();

// Retrieve thread.
router.get("/:id1/:id2", function(req, res) {
  var user1, user2;
  res.jsonResultOf(models.User.findById(req.params.id1)
  .then(function(user) {
    if (!user) {
      throw { status: 404 };
    }
    user1 = user;
    return models.User.findById(req.params.id2);
  })
  .then(function(user) {
    if (!user) {
      throw { status: 404 };
    }
    user2 = user;
    var options = {};
    if (req.query.before) {
      options.before = new Date(req.query.before);
    }
    if (req.query.limit != null) {
      options.limit = parseInt(req.query.limit);
    }
    return models.Message.findByUserIds(user1.id, user2.id, options);
  })
  );
});

module.exports = router;
