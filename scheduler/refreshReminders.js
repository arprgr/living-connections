var models = require('../server/models/index');
var Moment = require('moment-timezone');
const Message = require("../server/models/index").Message;

function insertMessage(reminder) {
    var messageFields = {
        type: 5,
        status: 1,
        fromUserId: 0,
        toUserId: 0,
        assetId: 0
    }
    
    messageFields.fromUserId = reminder.fromUserId;
    messageFields.toUserId = reminder.toUserId;
    messageFields.assetId = reminder.assetId;
    
    Message.create(messageFields).then(function(message){
    
    });
    
}

function processReminders() {
    var currentDateTime = Date.now();
    var noOfMessagesCreated = 0;
    
  return new Promise(function(resolve) {
  resolve(models.Reminders.findAll({ attributes: ['id', 'status', 'deliverAt', 'timeZone', 'Repeat', 'Expired' , 'lastDeliveredAt', 'fromUserId', 'toUserId', 'assetId'],
        where: {
        $not: [ { Expired : 'Yes' } ]}
            }).then(function(Reminders) {
            if (!Reminders) {
            throw { status: 401 };
            }
        else {   
        Reminders.forEach(function (reminder) {
        var deliverAt = reminder.deliverAt;
        var timeZone = reminder.timeZone;
        var repeat = reminder.Repeat;
        var id = reminder.id;
        var lastDeliveredAt = reminder.lastDeliveredAt ;
        var expired = reminder.Expired;
        var date = new Date(deliverAt);
        var rightNow = new Date(currentDateTime);

        if (process.env.NODE_ENV == "test") {  //set rightNow to the mock test date and time
        rightNow = new Date('2030-01-01T02:00:00-05:00'); // January 1, 2030 02:00:00 GMT-0500
        }    

        var lastDeliveredAtDate; var actualDeliveryDate;

        if (lastDeliveredAt != 'Never') { lastDeliveredAtDate = new Date(lastDeliveredAt) };

        var newYorkTime = Moment.tz(date, "America/New_York");
        var losAngeles = newYorkTime.clone().tz("America/Los_Angeles");
        var centralAmerica = newYorkTime.clone().tz("America/Chicago");
        var india = newYorkTime.clone().tz("Asia/Kolkata");    
        var actualDeliveryDateNY = Moment.tz(rightNow, "America/New_York");


        if (timeZone == "Eastern") {
        deliverAt = newYorkTime.format();
        actualDeliveryDate = actualDeliveryDateNY.format();
        } ;

        if (timeZone == "Central") {
        deliverAt = centralAmerica.format();
        actualDeliveryDate = actualDeliveryDateNY.clone().tz("America/Chicago").format();
        } ;
        if (timeZone == "Pacific") {
        deliverAt = losAngeles.format();
        actualDeliveryDate = actualDeliveryDateNY.clone().tz("America/Los_Angeles").format(); 
        } ;
        if (timeZone == "IST") {
        deliverAt = india.format();
        actualDeliveryDate = actualDeliveryDateNY.clone().tz("Asia/Kolkata").format();
        } ;


        var deliverAtHours = parseInt(date.getHours());
        var deliverAtMinute = parseInt(date.getMinutes());
        var deliverAtDate = parseInt(date.getDate());
        var deliverAtMonth = parseInt(date.getMonth());
        var deliverAtYear = parseInt(date.getFullYear());    

        var nowHours = parseInt(rightNow.getHours());
        var nowMinutes = parseInt(rightNow.getMinutes()) +15; // cover the next fifteen minutes
        var nowDate = parseInt(rightNow.getDate());
        var nowMonth = parseInt(rightNow.getMonth());
        var nowYear = parseInt(rightNow.getFullYear());        

        var lastDeliveredAtHours , lastDeliveredAtMinute, lastDeliveredAtDay, lastDeliveredAtMonth;

        if (lastDeliveredAt != 'Never') {
        lastDeliveredAtHours = parseInt(lastDeliveredAtDate.getHours());
        lastDeliveredAtMinute = parseInt(lastDeliveredAtDate.getMinutes());
        lastDeliveredAtDay = parseInt(lastDeliveredAtDate.getDate());
        lastDeliveredAtMonth = parseInt(lastDeliveredAtDate.getMonth());
        }



if (repeat == 1) {
    if (lastDeliveredAt != 'Never') {  
        

    if (deliverAtHours == nowHours && deliverAtMinute <= nowMinutes && rightNow > lastDeliveredAtDate && deliverAtYear <= nowYear  ) { 
    models.Reminders.update (
    { 
        Repeat : 1,
        lastDeliveredAt : actualDeliveryDate,

    },
    { where: {id: id}}         
    ).then(function(affectedRows){

    });
    }     
    }
    else {
    if (deliverAtHours == nowHours && deliverAtMinute <= nowMinutes && deliverAtYear <= nowYear ) { 
    models.Reminders.update (
    { 
    Repeat : 1,
    lastDeliveredAt : actualDeliveryDate 
    },
    { where: {id: id}}         
    ).then(function(affectedRows){
    });
    }    

    } 
    } else {

    if (deliverAtHours == nowHours && deliverAtMinute == nowMinutes && deliverAtDate == nowDate && deliverAtMonth == nowMonth && expired != 'Yes') { 
    models.Reminders.update (
    { 
    Expired: 'Yes',
    lastDeliveredAt : actualDeliveryDate
    },
    { where: {id: id}}         
    ).then(function(affectedRows){
    });

    } 

    }      
    })
    return('Batch Run Successfully');
    }
    }));
    });
 
}

function RefreshReminders() {
  
}

RefreshReminders.prototype = {
  processReminders: function() {
    return(processReminders()); 
  },
};


module.exports = RefreshReminders;
