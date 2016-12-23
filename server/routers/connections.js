/* connections.js */

module.exports = (function() {
  const Connection = require("../models/index").Connection;
  const router = require("express").Router();

  // All of these functions require at least some valid user.
  router.use(function(req, res, next) {
    if (!req.user) {
      res.jsonError({ status: 401 });
    }
    else {
      next();
    }
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(Connection.destroy({ where: {} }));
  });

  return router;
})();
