/* routers/admin.js */

module.exports = (function() {
  const Promise = require("promise");
  const express = require("express");
  const registrationLogic = require("../biz/registration");
  const router = express.Router();

  router.post("/register", function(req, res) {
    var target = {};
    registrationLogic.register(req.body, target)
    .then(function() {
      res.json(target);
    })
    .catch(function(error) {
      res.json({ error: String(error) });
    });
  });

  return router;
})();
