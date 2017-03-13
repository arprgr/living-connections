var express = require('express');
var router = express.Router();
var models = require('../models/index');
var Moment = require('moment-timezone');
var refreshReminders = require('../../scheduler/refreshReminders');

/* GET users listing. */
router.get('/', function(req, res, next) {

 var processReminderHandle = new refreshReminders() ;

 
   res.status(200).send(processReminderHandle.processReminders());  
     
     
    
});

module.exports = router;
