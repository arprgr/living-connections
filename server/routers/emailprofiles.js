/* emailprofiles.js */

module.exports = (function() {
  const router = require("express").Router();
  const EmailProfile = require("../models/index").EmailProfile;

  // Retrieve (by id)
  router.get("/:id", function(req, res) {
    res.jsonResultOf(EmailProfile.findById(req.params.id));
  });

  // Delete all.
  router.delete("/", function(req, res) {
    res.jsonResultOf(EmailProfile.destroyAll());
  });

  return router;
})();
