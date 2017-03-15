const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Reminders Batch API", function(client) {

describe("Creating Test Reminder", function() {
    var fromUserId = 1;
    var toUserId = 1;


    function post(data) {
      return client.makeRequest("POST", "/api/reminders").withData(data);
    }

    it("Creates a seed reminder for 1st Jan 2030", function(done) {
      post({
      deliverAt: '2030-01-01T02:00:00-05:00',    
      assetId: 524,
      toUserId: 1,
      fromUserId: 1 ,    
      repeat: 1,    
      timeZone: 'Eastern'
      }).asUser(1).getJson()
      .then(function(reminder) {  
        expect(reminder.assetId).to.equal(524);
        done();
      })
      .catch(done);
    });
    
    it("Creates a seed reminder for 1st Jan 2033", function(done) {
      post({
      deliverAt: '2033-01-01T02:00:00-05:00',    
      assetId: 524,
      toUserId: 1,
      fromUserId: 1,    
      repeat: 1,     
      timeZone: 'Eastern'
      }).asUser(1).getJson()
      .then(function(reminder) {  
        expect(reminder.assetId).to.equal(524);
        done();
      })
      .catch(done);
    });
    
    it("Clears the Messages table before the batch run", function(done) {     
      client.makeRequest("DELETE", "/api/messages").asUser(fromUserId) 
      .getJson()
      .then(function(expector) {  
         expect(expector).to.be.below(1000); 
        done();
      })
      .catch(done);
    });
    
    it("Processes Reminders by setting date to 1st Jan 2030", function(done) {
       client.makeRequest("Post", "/refreshReminders").asUser(fromUserId) 
      .getJson()
      .then(function(result) {     
       expect(result.result).to.equal('success'); 
       done();
      })
      .catch(done);
    });
    
    it("It will have only one reminder message for 1st Jan 2030", function(done) {
       client.makeRequest("DELETE", "/api/messages").asUser(fromUserId) 
      .getJson()
      .then(function(expector) {    
         expect(expector).to.equal(1); 
        done();
      })
      .catch(done);
    });
    

  });
});
