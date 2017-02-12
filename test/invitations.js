const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Invitations", function(client) {

  const TEST_USER_NAME = "Jack";
  const TEST_ASSET_ID = 6;

  var sender;

  // Methods...

  function createUser(name) {
    return client.makeRequest("POST", "/api/users")
    .withData({ name: name }).asRoot().expectStatusCode(200).getJson().go()
  }

  function sendInvitation(fromUserId, email) {
    return client.makeRequest("POST", "/api/invites")
    .asUser(fromUserId)
    .withData({
      assetId: TEST_ASSET_ID,
      email: email
    });
  }

  function sendInvitationOk(fromUserId, email) {
    return sendInvitation(fromUserId, email).expectStatusCode(200).getJson().go();
  }

  function sendInvitationError(fromUserId, email, expectedStatusCode) {
    return sendInvitation(fromUserId, email).expectStatusCode(expectedStatusCode).go();
  }

  function retrieveTicket(id) {
    return client.makeRequest("GET", "/api/invites/" + id).asRoot().expectStatusCode(200).getJson().go();
  }

  function claimTicket(ticket) {
    return client.makeRequest("GET", "/?e=" + ticket.externalId).expectRedirect("/").getSetCookie("s").go();
  }

  function requestActionList(sessionCookie) {
    return client.makeRequest("GET", "/a").withCookie("s", sessionCookie).expectStatusCode(200).getJson().go();
  }

  function findMessageAction(actionResponse, fromUserId) {
    var actionList = actionResponse.actionItems;
    expect(actionList).to.exist;
    for (var i = 0; i < actionList.length; ++i) {
      if (actionList[i].message && actionList[i].message.fromUser.id == fromUserId) {
        return actionList[i];
      }
    }
  }

  function cancelInvitation(id, userId) {
    return client.makeRequest("DELETE", "/api/invites/" + id).asUser(userId);
  }

  function cancelInvitationOk(id, userId) {
    return cancelInvitation(id, userId).expectStatusCode(200).getJson().go();
  }

  function cancelInvitationError(id, userId, expectedStatusCode) {
    return cancelInvitation(id, userId).expectStatusCode(expectedStatusCode).go();
  }

  // Create sender.
  beforeEach(function(done) {
    createUser(TEST_USER_NAME)
    .then(function(user) {
      expect(user.name).to.equal(TEST_USER_NAME);
      sender = user;
      done();
    })
    .catch(done);
  });

  it("rejects invalid email", function(done) {
    sendInvitationError(sender, "blah", 500)
    .then(function() {
      done();
    })
    .catch(done);
  });

  describe("...", function() {

    var TEST_EMAIL = "test@example.com";
    var invite;

    // Create invitation.
    beforeEach(function(done) {
      sendInvitationOk(sender.id, TEST_EMAIL)
      .then(function(_invite) {
        invite = _invite;
        expect(invite.fromUserId).to.equal(sender.id);
        expect(invite.assetId).to.equal(TEST_ASSET_ID);
        expect(invite.email).to.equal(TEST_EMAIL);
        done();
      })
      .catch(done);
    });

    describe("once claimed...", function() {

      var sessionCookie;

      beforeEach(function(done) {
        // Holder of the email account claims ticket.
        claimTicket(invite)
        .then(function(_sessionCookie) {
          sessionCookie = _sessionCookie;
          expect(sessionCookie).to.exist;
          done();
        })
        .catch(done);
      });

      it("deliver messages", function(done) {
        requestActionList(sessionCookie)
        .then(function(actionResponse) {
          // Action list is expected to contain a message from the sender.
          var messageAction = findMessageAction(actionResponse, sender.id);
          expect(messageAction).to.exist;
          expect(typeof messageAction.id).to.equal("string");
          expect(messageAction.id.substring(0, 7)).to.equal("inv-rec");
          done();
        })
        .catch(done);
      });

      it("become void", function(done) {
        retrieveTicket(invite.id)     // tickets and invites are one and the same, for now.
        .then(function(ticket) {
          expect(ticket.id).to.equal(invite.id);
          expect(ticket.externalId).to.equal(invite.externalId);
          expect(ticket.messageId).to.not.exist;
          expect(ticket.fromUserId).to.be.null;
          done();
        })
        .catch(done);
      });
    });

    describe("cancelled...", function(done) {

      beforeEach(function(done) {
        // The sender cancels the invitation before it is received.
        cancelInvitationOk(invite.id, sender.id)
        .then(function() {
          return claimTicket(invite);
        })
        .then(function(_sessionCookie) {
          // Ticket is not voided.
          sessionCookie = _sessionCookie;
          expect(sessionCookie).to.exist;
          done();
        })
        .catch(done);
      });

      it("suppress delivery of the message", function(done) {
        requestActionList(sessionCookie)
        .then(function(actionResponse) {
          // Action list is expected not to contain a message from the sender.
          var messageAction = findMessageAction(actionResponse, sender.id);
          expect(messageAction).to.not.exist;
          done();
        })
        .catch(done);
      });
    });
  });
});
