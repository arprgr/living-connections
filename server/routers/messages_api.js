/* messages_api.js */

const Message = require("../models/index").Message;
const Connection = require("../models/index").Connection;
const ApiValidator = require("./api_validator");
const Promise = require("promise");

const DEFAULT_ANNOUNCEMENT_DURATION = 14*24*60*60*1000;   // 14 days

const VALIDATOR = new ApiValidator({
  assetId: {
    required: true,
    type: "integer"
  },
  endDate: {
    type: "date"
  },
  startDate: {
    type: "date"
  },
  toUserId: {
    constant: true,
    type: "integer"
  },
  type: {
    defaultValue: 0,
    maxValue: Message.MAX_TYPE,
    minValue: 0,
    type: "integer"
  }
});

var router = require("express").Router();

function acceptInvitation(message) {
  // When an invitation is accepted by the receiver, the sender makes a connection to the receiver.
  return Connection.regrade(message.fromUserId, message.toUserId, 1)
  .then(function() {
    return message;
  })
}

function rejectInvitation(message) {
  return Connection.regrade(message.toUserId, message.fromUserId, 0)
  .then(function() {
    return message;
  });
}

// Retrieve message by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(Message.findById(req.params.id, { deep: true })
  .then(function(message) {
    if (!message) {
      throw { status: 404 };
    }
    // A message may be viewed only by the sender, the receiver, or an admin.
    if (req.user.id != message.fromUserId &&
      req.user.id != message.toUserId &&
      !(req.user.level <= 0)) {
      throw { status: 401 };
    }
    // This method can execute one or more actions as side effects.
    // Not sure that this is the greatest API design, but it serves the
    // purpose of enabling acceptance and rejection of invitation
    // messages.
    var action = req.query.act;
    if (action) {
      // Accept/reject an invitation.
      if (message.type != Message.INVITE_TYPE || message.toUserId != req.user.id) {
        throw { status: 401 };
      }
      if (action == "accept") {
        return acceptInvitation(message);
      }
      else if (action == "reject") {
        return rejectInvitation(message)
      }
      else {
        throw { status: 500 };
      }
    }
    return message;
  }));
});

// Delete message by ID
router.delete("/:id", function(req, res) {
  res.jsonResultOf(Message.findById(req.params.id)
  .then(function(message) {
    if (!message) {
      throw { status: 404 };
    }
    // A message may be deleted only by the sender.
    if (req.user.id != message.fromUserId &&
      !(req.user.level <= 0)) {
      throw { status: 401 };
    }
    return Message.destroyById(req.params.id);
  }));
});

if (process.env.NODE_ENV == "test") {
  // Delete all messages
  router.delete("/", function(req, res) {
    res.jsonResultOf(new Promise(function(resolve) {
      resolve(Message.destroyAll());
    }))
  });
}

// Create a message.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.validateNew(req.body);
    fields.fromUserId = req.user.id;
    
    // TODO: validate asset.

    // Validate toUserId.
    var toUserId = fields.toUserId;
    var personal = false;
    switch (fields.type) {
    case Message.GREETING_TYPE:
    case Message.INVITE_TYPE:
      personal = true;
    }
    if ((toUserId == null) == personal) {
      throw { body: { toUserId: toUserId || "?" }};
    }

    // TODO: validate toUser.

    switch (fields.type) {
    case Message.ANNOUNCEMENT_TO_ALL_TYPE:
    case Message.ANNOUNCEMENT_TO_NEW_TYPE:
      if (!(req.user.level <= 0)) {
        throw { status: 401 };
      }
      if (!fields.startDate) {
        fields.startDate = new Date();
      }
      if (!fields.endDate) {
        fields.endDate = new Date(fields.startDate.getTime() + 30*24*60*60*1000);
      }
    }

    resolve(Message.create(fields));
  }))
});

// Update message by ID.
router.put("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.prevalidateUpdate(req.body);
    resolve(Message.findById(req.params.id)
      .then(function(message) {
        if (!message) {
          throw { status: 404 };
        }

        fields = VALIDATOR.postvalidateUpdate(message, fields);
        if (!fields) {
          return message;
        }

        switch (fields.type) {
        case Message.ANNOUNCEMENT_TO_ALL_TYPE:
        case Message.ANNOUNCEMENT_TO_NEW_TYPE:
          if (!(req.user.level <= 0)) {
            throw { status: 401 };
          }
          break;
        default:
          if ("type" in fields) {
            throw { body: { type: fields.type } };
          }
        }

        return message.updateAttributes(fields);
      })
    );
  }))
});

module.exports = router;
