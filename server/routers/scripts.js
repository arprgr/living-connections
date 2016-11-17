/* scripts.js */

module.exports = (function() {
  const express = require("express");
  const router = express.Router();
  const models = require("../models/index");

  // Create
  router.get("/register", function(req, res) {
    var email = req.query.email;
    var name = req.query.name;
    if (!email) {
      res.json({ error: "email required" });
    }
    else if (!name) {
      res.json({ error: "name required" });
    }
    else {
      var user;
      var emailProfile;

      models.User.create({
        name: name
      }).then(function(u) {
        user = u;
      }).then(function() {
        return models.EmailProfile.create({
          email: email,
          UserId: user.id
        });
      }).then(function(ep) {
        emailProfile = ep;
      }).then(function() {
        res.json({ user: user, emailProfile: emailProfile });
      }).catch(function(error) {
        res.json(error);
      });
    }
  });

  return router;
})();
