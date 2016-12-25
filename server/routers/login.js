/* login.js */

const admittance = require("../biz/admittance");

var router = require("express").Router();

router.get("/", function(req, res) {
  if (req.query.email) {
    res.jsonResultOf(admittance.createTicket(req, req.query.email));
  }
  else {
    res.jsonError({});
  }
});

module.exports = router;
