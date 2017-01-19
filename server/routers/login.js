/* login.js */

const admittance = require("../biz/admittance");

var router = require("express").Router();

router.get("/", function(req, res) {
  res.jsonResultOf(new admittance.Ticket(req, req.query.email).process());
});

module.exports = router;
