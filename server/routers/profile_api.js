/* profile_api.js */

const models = require("../models/index");
const ApiValidator = require("./api_validator");

const VALIDATOR = new ApiValidator({
  assetId: {
    type: "integer"
  },
  name: {
    required: true,
    type: "string"
  }
});

var router = require("express").Router();

if (process.env.NODE_ENV == "test") {

  // Create profile.
  router.post("/", function(req, res) {
    var fields = VALIDATOR.validateNew(req.body);
    res.jsonResultOf(models.User.create(fields));
  });

  // Delete profile.
  router.delete("/", function(req, res) {
    var userId = req.user.id;
    res.jsonResultOf(models.User.destroyById(userId));
  });
}

// Retrieve profile.
router.get("/", function(req, res) {
  var userId = req.user.id;
  res.jsonResultOf(models.User.findById(userId)
  .then(function(user) {
    if (!user) {
      throw { status: 404 };
    }
    return user;
  }));
});

// Update profile.
router.put("/", function(req, res) {
  var userId = req.user.id;
  var fields = VALIDATOR.prevalidateUpdate(req.body);
  res.jsonResultOf(models.User.findById(userId)
    .then(function(user) {
      if (!user) {
        throw { status: 404 };
      }

      fields = VALIDATOR.postvalidateUpdate(user, fields);
      if (!fields) {
        return user;
      }

      return user.updateAttributes(fields);
    })
  );
});

module.exports = router;
