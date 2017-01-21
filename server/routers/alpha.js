/* routers/alpha.js */

const express = require("express");
const Promise = require("promise");
const ActionCompiler = require("../biz/actions");
const admittance = require("../biz/admittance");
const models = require("../models/index");

var router = express.Router();

// Get actions for current user. 
router.get("/a", function(req, res) {
  if (req.session && req.user) {
    res.jsonResultOf(new ActionCompiler(req.user).run());
  }
  else {
    res.json({});
  }
});

// Request a login ticket via email.
router.get("/l", function(req, res) {
  res.jsonResultOf(new admittance.Ticket(req, req.query.email).process());
});

// Log out.
router.get("/o/:sid", function(req, res) {
  var sessionId = req.params.sid;
  res.jsonResultOf(models.Session.destroyByExternalId(sessionId));
});

module.exports = router;
