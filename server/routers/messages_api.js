/* messages_api.js */

const models = require("../models/index");
const Message = models.Message;

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

// Retrieve message by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(Message.findById(req.params.id, { deep: true })
  .then(function(message) {
    if (message) {
      // A message can be viewed only by the sender, the receiver, or an admin.
      if (req.user.id == message.fromUserId ||
        req.user.id == message.toUserId ||
        req.user.level <= 0) {
        throw { status: 401 };
      }
    }
    return message;
  }))
});

const SCHEMA = {
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
}

const DEFAULT_ANNOUNCEMENT_DURATION = 14*24*60*60*1000;   // 14 days

function checkInputFields(schema, fields) {
  var validFields = {};
  var invalidFields = {};
  var invalidFieldCount = 0;
  for (var key in fields) {
    if (fields.hasOwnProperty(key)) {
      var value = fields[key];
      var desc = schema[key];
      try {
        switch (desc.type) {
        case "integer":
          value = parseInt(value);
          if (isNaN(value)) {
            throw {};
          }
          if ("maxValue" in desc && value > desc.maxValue) {
            throw {};
          }
          if ("minValue" in desc && value < desc.minValue) {
            throw {};
          }
          break;
        case "date":
          value = new Date(value);
          break;
        }
        validFields[key] = value;
      }
      catch (e) {
        invalidFields[key] = value;
        invalidFieldCount += 1;
      }
    }
  }
  if (invalidFieldCount) {
    throw { body: invalidFields };
  }
  return validFields;
}

function isEmpty(fields) {
  for (var key in fields) {
    return false;
  }
  return true;
}

function checkMissingFields(schema, fields) {
  var missingFields = {};
  var missingFieldCount = 0;
  for (var key in schema) {
    var desc = schema[key];
    if (!(key in fields)) {
      if ("defaultValue" in desc) {
        fields[key] = desc.defaultValue;
      }
      else if (desc.required) {
        missingFields[key] = "?";
        missingFieldCount += 1
      }
    }
  }
  if (missingFieldCount) {
    throw { body: missingFields };
  }
  return fields;
}

function validateNew(schema, fields) {
  var validFields = checkInputFields(schema, fields);
  return checkMissingFields(schema, validFields);
}

function prevalidateUpdate(schema, fields) {
  return checkInputFields(schema, fields);
}

function postvalidateUpdate(schema, model, fields) {
  var changingFields = {};
  var invalidFields = {};
  var invalidFieldCount = 0;
  for (var key in fields) {
    if (fields.hasOwnProperty(key)) {
      var value = fields[key];
      var desc = schema[key];
      if (value != model[key]) {
        if (desc.constant) {
          invalidFields[key] = value;
          invalidFieldCount += 1;
        }
        else {
          changingFields[key] = value;
        }
      }
    }
  }
  if (invalidFieldCount) {
    throw { body: invalidFields };
  }
  return changingFields;
}

// Create a message.
router.post("/", function(req, res) {
  var fields = validateNew(SCHEMA, req.body);
  fields.fromUserId = req.user.id;

  // Validate toUserId.
  var toUserId = fields.toUserId;
  var personal = false;
  switch (fields.type) {
  case Message.GREETING_TYPE:
  case Message.INVITE_TYPE:
    personal = true;
  }
  if ((toUserId == null) == personal) {
    res.jsonError({ body: { toUserId: toUserId || "?" }});
    return;
  }

  switch (fields.type) {
  case Message.ANNOUNCEMENT_TO_ALL_TYPE:
  case Message.ANNOUNCEMENT_TO_NEW_TYPE:
    if (!(req.user.level <= 0)) {
      res.jsonError({ status: 401 });
      return;
    }
    if (!fields.startDate) {
      fields.startDate = new Date();
    }
    if (!fields.endDate) {
      fields.endDate = new Date(fields.startDate.getTime() + 30*24*60*60*1000);
    }
  }

  res.jsonResultOf(Message.create(fields));
});

// Update message by ID.
router.put("/:id", function(req, res) {
  var fields = prevalidateUpdate(SCHEMA, req.body);
  res.jsonResultOf(Message.findById(req.params.id)
    .then(function(message) {
      if (!message) {
        throw { status: 404 };
      }

      fields = postvalidateUpdate(SCHEMA, message, fields);
      if (isEmpty(fields)) {
        return {};
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
});

module.exports = router;
