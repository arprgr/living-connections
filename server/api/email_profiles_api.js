/* email_profiles_api.js */

const EmailProfile = require("../models/index").EmailProfile;
const ApiValidator = require("./api_validator");
const Promise = require("promise");

const VALIDATOR = new ApiValidator({
  userId: {
    required: true,
    type: "integer"
  },
  email: {
    required: true,
    type: "email"
  }
});

var router = require("express").Router();

// Create an email profile.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    // Admin only.
    if (!req.isAdmin) {
      throw { status: 401 };
    }
    resolve(EmailProfile.create(VALIDATOR.validateNew(req.body)));
  }))
});

module.exports = router;
