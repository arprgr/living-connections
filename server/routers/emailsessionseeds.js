/* emailsessionseeds.js */

module.exports = (function() {
  const EmailSessionSeed = require("../models/index").EmailSessionSeed;
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
    res.jsonResultOf(EmailSessionSeed.destroy({ where: {} }));
  });

  return router;
})();

