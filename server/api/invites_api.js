/* invites_api.js */

const CONFIG = require("../conf");
const admittance = require("../biz/admittance");
const models = require("../models/index");
const Invite = models.Invite;
const Ticket = models.EmailSessionSeed;
const ApiValidator = require("./api_validator");
const Promise = require("promise");
const random = require("../util/random");

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
  },
  name: {
    required: true,
    type: "string"
  }
});

// Retrieve invite by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(Invite.findById(req.params.id, { deep: true })
  .then(function(invite) {
    if (!invite) {
      throw { status: 404 };
    }
    // An invite may be viewed only by the sender or an admin.
    if (!req.isAdmin && req.user.id != invite.fromUserId) {
      throw { status: 401 };
    }
    return invite;
  }));
});

// Create an invite.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fromUser = req.user;
    if (!fromUser) {
      throw { status: 401 };
    }
    var fields = VALIDATOR.validateNew(req.body);
    var theTicket;

    resolve(models.Asset.findById(fields.assetId)
    .then(function(asset) {
      if (!asset) {
        throw { status: 500 };
      }
      if (asset.creatorId != fromUser.id) {
        throw { status: 401 };
      }
      return Ticket.builder()
      .externalId(random.id())
      .email(fields.email)
      .expiresAt(admittance.inviteExpiresAt())
      .build()
      .then(function(ticket) {
        theTicket = ticket;
        return Invite.builder()
          .fromUser(fromUser)
          .ticket(ticket)
          .asset(asset)
          .recipientName(fields.name)
          .build();
      })
      .then(function(invite) {
        var emailPromise = admittance.sendInvitationEmail(req, invite, theTicket, fields.email);
        if (CONFIG.env == "test") {
          return emailPromise.then(function() {
            return invite;
          });
        }
        return invite;
      })
    }));
  }));
});

// Update the invite by ID.
router.put("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.prevalidateUpdate(req.body);
    resolve(Invite.findById(req.params.id)
    .then(function(invite) {
      if (!invite) {
        throw { status: 404 };
      }
      if (!req.isAdmin && req.user.id != invite.fromUserId) {
        throw { status: 401 };
      }
      fields = VALIDATOR.postvalidateUpdate(invite, fields);
      if (!fields) {
        return invite;
      }
      if (invite.state != 0) {
        throw { status: 500 };  // too late.
      }
      return invite.updateAttributes(fields);
    }));
  }));
});

// Mark the invite as having been received.
router.post("/:id/respond", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    if (!req.user) {
      throw { status: 401 };
    }
    resolve(Invite.findById(req.params.id)
    .then(function(invite) {
      if (!invite) {
        throw { status: 404 };
      }
      if (invite.state != 0) {
        throw { status: 500 };  // too late.
      }
      return invite.updateAttributes({
        state: 1,
        toUserId: req.user.id 
      });
    }));
  }));
});

// Accept the invite.
router.post("/:id/accept", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    resolve(Invite.findById(req.params.id)
    .then(function(invite) {
      if (!invite) {
        throw { status: 404 };
      }
      if (!req.isAdmin && req.user.id != invite.toUserId) {
        throw { status: 401 };
      }
      return invite.updateAttributes({
        state: 2
      })
      .then(function() {
        return models.Connection.regrade(invite.toUserId, invite.fromUserId, 1);
      })
      .then(function() {
        return models.Connection.regrade(invite.fromUserId, invite.toUserId, 1);
      })
      .then(function() {
        return invite;
      });
    }))
  }));
});

// Reject the invite.
router.post("/:id/reject", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    resolve(Invite.findById(req.params.id)
    .then(function(invite) {
      if (!invite) {
        throw { status: 404 };
      }
      if (!req.isAdmin && req.user.id != invite.toUserId) {
        throw { status: 401 };
      }
      return invite.updateAttributes({
        state: 3
      });
    }));
  }));
});

// Delete invite by ID
router.delete("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    // Invitation is removed, but the ticket remains.
    resolve(Invite.findById(req.params.id)
    .then(function(invite) {
      if (!invite) {
        throw { status: 404 };
      }
      if (!req.isAdmin && req.user.id != invite.fromUserId) {
        throw { status: 401 };
      }
      return invite.destroy();
    }));
  }));
});

if (process.env.NODE_ENV == "test") {
  // Delete all invites
  router.delete("/", function(req, res) {
    res.jsonResultOf(Invite.destroyAll());
  });
}

module.exports = router;
