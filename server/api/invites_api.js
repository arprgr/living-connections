/* invites_api.js */

// There is no Invite model type, but this router follows the same general pattern as for model-
// related routers.  An invitation is represented by a EmailSessionSeed model with non-null
// fromUserId and messageId fields.  TODO: add a true Invite model type, which associates an 
// EmailSessionSeed with a message.  And alter the video recorder to work with messages as well
// as assets.

const admittance = require("../biz/admittance");
const EmailSessionSeed = require("../models/index").EmailSessionSeed;
const Message = require("../models/index").Message;
const ApiValidator = require("./api_validator");
const Promise = require("promise");

var router = require("express").Router();

const VALIDATOR = new ApiValidator({
  assetId: {
    required: true,
    type: "integer"
  },
  email: {
    constant: true,
    required: true,
    type: "email"
  }
});

function fakeInvite(ticket, message) {
  return {
    id: ticket.id,
    externalId: ticket.externalId,
    fromUserId: ticket.fromUserId,
    email: ticket.email,
    assetId: message && message.assetId
  }
}

// Retrieve invite by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(EmailSessionSeed.findById(req.params.id, { deep: true })
  .then(function(invite) {
    if (!invite) {
      throw { status: 404 };
    }
    // An invite may be viewed only by the sender or an admin.
    if (!req.isAdmin && req.user.id != invite.fromUserId) {
      throw { status: 401 };
    }
    return fakeInvite(invite, invite.message);
  }));
});

// Create an invite.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.validateNew(req.body);
    fields.fromUserId = req.user.id;
    // TODO: validate asset.

    resolve(new admittance.Invitation(req, fields.email, req.user, fields.assetId)
      .process()
      .then(function(result) {
        return fakeInvite(result.ticket, result.message);
      }));
  }));
});

// Update the invite by ID - only the asset may be changed.
router.put("/:id", function(req, res) {
  var fields = VALIDATOR.prevalidateUpdate(req.body);
  res.jsonResultOf(EmailSessionSeed.findById(req.params.id, { deep: true })
  .then(function(invite) {
    if (!invite) {
      throw { status: 404 };
    }
    if (!req.isAdmin && req.user.id != invite.fromUserId) {
      throw { status: 401, body: { user: req.user, invite: invite } };
    }
    fields = VALIDATOR.postvalidateUpdate(invite.message, fields);
    if (!fields) {
      return fakeInvite(invite, invite.message);
    }
    return invite.message.updateAttributes(fields).then(function() {
      return fakeInvite(invite, invite.message);
    });
  }));
});

// Delete invite by ID
router.delete("/:id", function(req, res) {
  // Invitation is voided, but the ticket remains.
  res.jsonResultOf(EmailSessionSeed.findById(req.params.id)
  .then(function(invite) {
    if (!invite) {
      throw { status: 404 };
    }
    if (!req.isAdmin && req.user.id != invite.fromUserId) {
      throw { status: 401 };
    }
    return invite.updateAttributes({ fromUserId: null, messageId: null });
  }));
});

if (process.env.NODE_ENV == "test") {
  // Delete all invites
  router.delete("/", function(req, res) {
    res.jsonResultOf(EmailSessionSeed.destroyAll());
  });
}

module.exports = router;
