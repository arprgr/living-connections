/* routers/alpha.js */

const express = require("express");
const Promise = require("promise");
const ActionCompiler = require("../biz/actions");
const admittance = require("../biz/admittance");
const models = require("../models/index");
const AuthMgr = require("../auth");
const ApiValidator = require("../api/api_validator");

var router = express.Router();

// Get actions for current user. 
router.get("/a", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    resolve(new ActionCompiler((req.session && req.session.user) || req.user).run());
  }));
});

// Log in with Facebook.
router.post("/f", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    resolve(new AuthMgr(req, res).handleFacebookLogin(req.body.id, {
      name: req.body.name,
      email: req.body.email,
      picture: req.body.picture
    }));
  }));
});

// Request a login ticket via email.
router.get("/l", function(req, res) {

  const VALIDATOR = new ApiValidator({
    "_": {
    },
    email: {
      constant: true,
      required: true,
      type: "email"
    }
  });

  res.jsonResultOf(new Promise(function(resolve, reject) {
    var fields = VALIDATOR.validateNew(req.query);
    resolve(new admittance.Ticket(req, fields.email).process()
    .then(function(ticketInfo) {
      return ticketInfo.ticket;
    }));
  }));
});

// Log out.
router.get("/o/:sid", function(req, res) {
  var sessionId = req.params.sid;
  res.jsonResultOf(models.Session.destroyByExternalId(sessionId));
});

module.exports = router;
