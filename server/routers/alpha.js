/* routers/alpha.js */

module.exports = (function() {
  const express = require("express");
  const ActionCompiler = require("../biz/actions");

  var router = express.Router();

  router.get("/", function(req, res) {

    if (req.session && req.user) {
      res.jsonResultOf(new ActionCompiler(req.user).run());
    }
    else {
      res.json({});
    }
  });

  return router;
})();
