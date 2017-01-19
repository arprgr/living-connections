/* invites.js */

// There is no Invite model type, but this router follows the same general pattern as for model-
// related routers.  An invitation is represented by a EmailSessionSeed model with non-null
// fromUserId and assetId fields.

const admittance = require("../biz/admittance");
const EmailSessionSeed = require("../models/index").EmailSessionSeed;

var router = require("express").Router();

// All of these functions require at least some valid user.
router.use(function(req, res, next) {
  if (req.user) {
    next();
  }
  else {
    res.jsonError({ status: 401 });
  }
});

// Create.
router.post("/", function(req, res) {
  res.jsonResultOf(new admittance.Invitation(req, req.body.email, req.user, req.body.assetId).process());
});

// Update the associated asset.
router.put("/:id", function(req, res) {
  EmailSessionSeed.findById(req.params.id)
  .then(function(emailSessionSeed) {
    if (req.user.level > 0 && req.user.id != emailSessionSeed.fromUserId) {
      res.jsonError({ status: 401 });
    }
    else {
      res.jsonResultOf(emailSessionSeed.updateAttributes({
        assetId: req.body.assetId
      }));
    }
  })
  .catch(function(err) {
    res.jsonError({ status: 404 });
  });
});

module.exports = router;
