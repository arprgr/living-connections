/* api.js */

var router = require("express").Router();

// All API functions require some sort of authentication.
router.use(function(req, res, next) {
  if (!req.user) {
    next({ status: 401 });
  }
  else {
    next();
  }
});

router.use("/invites", require("./invites_api"));
router.use("/messages", require("./messages_api"));
router.use("/profile", require("./profile_api"));
router.use("/users", require("./users_api"));

module.exports = router;
