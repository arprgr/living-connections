const expect = require("chai").expect;
const requestlc = require("./common/requestlc");
const fs = require("fs");
var goodMessageId;
var msgCreatedAt ;
var theUser;

const Moment = require('moment-timezone');
const TEST_SENDER_NAME = "Jack";

requestlc.describe("Messages Batch API", function(client) {

  describe("get method", function() {

    var fromUserId = 3;
    
    var seedProperties = {
      assetId: 5,
      toUserId: 4,
      type: 1
    };

     function createUser(name) {
      return client.makeRequest("POST", "/api/users")
      .withData({ name: name }).asRoot().getJson();
     } 

     function createProfile(theUser) {
      console.log('creating profile' + theUser.id);
      return client.makeRequest("POST", "/api/emailprofiles")
      .withData({userId: theUser.id, email: "user@test.net" }).asRoot().getJson();
     }

     function createMessage(theUser) {
      console.log('creating message for:' + theUser.id);
      seedProperties.toUserId = theUser.id;
      return client.makeRequest("POST", "/api/messages").asUser(theUser.id)
      .withData(seedProperties).getJson();
     }

   beforeEach(function(done) {
    createUser(TEST_SENDER_NAME)
    .then(function(user) {
      console.log('the user!!' + user.name +' id:' + user.id);
      expect(user.name).to.equal(TEST_SENDER_NAME);
      theUser = user;
      return createProfile(theUser);
    })
    .then(function(theProfile) {
      console.log('the profile:' + theProfile.userId + ' email:' + theProfile.email);
      expect(theProfile.email).to.equal('user@test.net');
      return createMessage(theUser);
    })
    .then(function(theMessage) {
      goodMessageId = theMessage.id;
      console.log('the Message:' + theMessage.id);
      console.log('the message to UserId'+ theMessage.toUserId);
      console.log('the message fromUserId'+ theMessage.fromUserId);
      expect(theMessage.toUserId).to.equal(theUser.id);
      expect(theMessage.fromUserId).to.equal(theUser.id);
      done();
    })
    .catch(done); 
    });

    function get(id) {
      return client.makeRequest("GET", "/api/messages/" + id);
    }


    it("It has created a new Message with timestamp of NOW", function(done) {
      get(goodMessageId).asRoot().getJson()
      .then(function(message) {
        msgCreatedAt = message.createdAt;
        console.log('message.createdAt:' + message.createdAt);
        console.log('goodMessageId:' + goodMessageId);
        console.log('fromUserId:' + message.fromUserId);
        console.log('msgCreatedAt:' + msgCreatedAt);
        expect(message.toUserId).to.equal(seedProperties.toUserId);
        done();
      })
      .catch(done);
    })
  });

  describe("post method", function() {
      var futureTime = new Moment(msgCreatedAt);
      futureTime.add(2, 'hours');

    function post(currTime) {
      console.log('calling sendreminders with :'+ currTime);
      return client.makeRequest("POST", "/api/messages/sendreminders/" + currTime);
    }
    

    it("running reminder batch with current time does not send reminders", function(done) {
      post(msgCreatedAt).go().then(function(expector) {
       expector.expectStatusCode(401);
       done();
      })
      .catch(done);
    });


    it("running reminder batch with future time sends reminders", function(done) {
    
      post(futureTime.format()).go().then(function(expector) {
      var receiverHTML = fs.readFileSync("tmp/receiver").toString();
      var senderHTML = fs.readFileSync("tmp/sender").toString();
      expect(receiverHTML.indexOf("has sent you a message that has not been viewed by you")).gt(0);
      expect(senderHTML.indexOf("A message you have sent to")).gt(0);
      done();
      })
      .catch(done);
    });


    it("running reminder batch with future time again does not send reminders", function(done) {
      post(futureTime.format()).go().then(function(expector) {
      expector.expectStatusCode(401);
      done();
      })
      .catch(done);
    });

  });
});
