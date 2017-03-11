/* reminders_api.js */

const Reminders = require("../models/index").Reminders;

const ApiValidator = require("./api_validator");
const Promise = require("promise");
var Moment = require('moment-timezone');



const VALIDATOR = new ApiValidator({
        deliverAt: {
        required: true,
        type: "string"  
        },    
        fromUserId: {
        required: true,
        type: "integer"  
        },
        toUserId: {
        required: true,
        type: "integer"
        },                                     
        assetId: {
        required: true,
        type: "integer"
        },
        repeat: {
        type: "integer",
        defaultValue: '1'                               
        },
        timeZone: {
        type: "string",
        defaultValue: 'Eastern'                               
        }
});

var router = require("express").Router();

function resloveDeliverDate (m_deliverAt, m_timeZone) {
    
    
    var newYorkTime = Moment.tz(m_deliverAt, "America/New_York");
    
      
    var losAngeles = newYorkTime.clone().tz("America/Los_Angeles");
    var centralAmerica = newYorkTime.clone().tz("America/Chicago");
    var india = newYorkTime.clone().tz("Asia/Kolkata");

    var _deliverAt = newYorkTime.format() ; // defaulting to eastern timezone

    if (m_timeZone == "Eastern") {_deliverAt = newYorkTime.format()} ;
    if (m_timeZone == "Central") {_deliverAt = centralAmerica.format()} ;
    if (m_timeZone == "Pacific") {_deliverAt = losAngeles.format()} ;
    if (m_timeZone == "IST") {_deliverAt = india.format()} ;
 
    return _deliverAt;
}

// Create a reminder.
router.post("/", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
  
    if (!req.user) {
      throw { status: 401 };
    }
      
    var fields = VALIDATOR.validateNew(req.body);

    var deliverAt = resloveDeliverDate(fields.deliverAt, fields.timeZone);   
      
          
    resolve(Reminders.create({
                assetId: fields.assetId,
                fromUserId: fields.fromUserId,
                toUserId : fields.toUserId,
                status: 1,
                timeZone: fields.timeZone, 
                Repeat : fields.repeat,
                Expired : 'No', 
                deliverAt: deliverAt,
                lastDeliveredAt: 'Never'
            }));
  }))
});

// Retrieve Reminder by ID
router.get("/:id", function(req, res) {
  console.log('In Get reminder for:' + req.params.id);    
  res.jsonResultOf(Reminders.findById(req.params.id, { deep: true })
  .then(function(reminder) {
    if (!reminder) {
      throw { status: 404 };
    }
    // A reminder may be viewed only by the sender, the receiver, or an admin.
    if (!req.isAdmin && req.user.id != reminder.fromUserId && req.user.id != reminder.toUserId) {
      throw { status: 401 };
    }
    return reminder;
  }));
});


// Delete Reminder by ID
router.delete("/:id", function(req, res) {
  console.log("in Delete Reminder for:" + req.params.id);    
  res.jsonResultOf(Reminders.findById(req.params.id)
  .then(function(reminder) {
    if (!reminder) {
      throw { status: 404 };
    }
    // A reminder may be deleted only by the sender.
    if (!req.isAdmin && req.user.id != reminder.fromUserId) {
      throw { status: 401 };
    }
    return Reminders.destroyById(req.params.id);
  }));
});

// Update reminder by ID.
router.put("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    var fields = VALIDATOR.prevalidateUpdate(req.body);
    resolve(Reminders.findById(req.params.id)
      .then(function(reminder) {
        if (!reminder) {
          throw { status: 404 };
        }

        fields = VALIDATOR.postvalidateUpdate(reminder, fields);
        if (!fields) {
          return reminder;
        }
    
    var deliverAt = resloveDeliverDate(fields.deliverAt, fields.timeZone);
        
    return reminder.updateAttributes({
        assetId: fields.assetId,
        deliverAt: deliverAt ,
        timeZone : fields.timeZone
        });
      })
    );
  }))
});

module.exports = router;
