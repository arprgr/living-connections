/* users_api.js */

const User = require("../models/index").User;
const ApiValidator = require("./api_validator");
const Promise = require("promise");

const VALIDATOR = new ApiValidator({
  name: {
    required: true,
    type: "string"
  },
  level: {
    defaultValue: 1,
    maxValue: 4,
    minValue: 0,
    type: "integer"
  }
});

var router = require("express").Router();

// Retrieve user by external ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(User.findByExternalId(req.params.id)
  .then(function(user) {
    if (!user) {
      throw { status: 404 };
    }
    // A user may be viewed only by itself or an admin.
    if (req.user.id != user.id && !(req.user.level <= 0)) {
      throw { status: 401 };
    }
    return user;
  }));
});

// Delete user by external ID
router.delete("/:id", function(req, res) {
  res.jsonResultOf(User.findByExternalId(req.params.id)
  .then(function(user) {
    if (!user) {
      throw { status: 404 };
    }
    // A user may be deleted only by the admin.
    if (!(req.user.level <= 0)) {
      throw { status: 401 };
    }
    return User.destroyById(user.id);
  }));
});

if (process.env.NODE_ENV == "test") {
  // Delete all users
  router.delete("/", function(req, res) {
    res.jsonResultOf(new Promise(function(resolve) {
      resolve(User.destroyAll());
    }))
  });
}

// Create a user.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    // A user may be created only by the admin.
    if (!(req.user.level <= 0)) {
      throw { status: 401 };
    }
    resolve(User.create(VALIDATOR.validateNew(req.body)));
  }))
});

// Update user by external ID.
router.put("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.prevalidateUpdate(req.body);
    resolve(User.findByExternalId(req.params.id)
      .then(function(user) {
        if (!user) {
          throw { status: 404 };
        }

        fields = VALIDATOR.postvalidateUpdate(user, fields);
        return fields ? user.updateAttributes(fields) : user;
      })
    );
  }))
});

module.exports = router;
