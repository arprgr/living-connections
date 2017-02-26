const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Invitations", function(client) {

  const TEST_USER_NAME = "Jack";
  const TEST_ASSET_ID = 6;

  var sender;

  // Methods...

  function createUser(name) {
    return client.makeRequest("POST", "/api/users")
    .withData({ name: name }).asRoot().getJson();
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
    return sendInvitation(fromUserId, email).getJson();
  }

  function claimTicket(ticket) {
    return client.makeRequest("GET", "/?e=" + ticket.externalId).go()
    .then(function(expector) {
      expector.expectRedirect("/");
      return expector.getSetCookie("s");
    });
  }

  function requestActionList(cred, credIsUserId) {
    var req = client.makeRequest("GET", "/a");
    credIsUserId ? req.asUser(cred) : req.withCookie("s", cred);
    return req.getJson();
  }

  function findAction(actionResponse, pred) {
    var actionList = actionResponse.actionItems;
    expect(actionList).to.exist;
    for (var i = 0; i < actionList.length; ++i) {
      if (pred(actionList[i])) {
        return actionList[i];
      }
    }
  }

  function findGreetingAction(actionResponse, toUserId) {
    return findAction(actionResponse, function(item) {
      return item.user && item.user.id == toUserId;
    });
  }

  function findMessageAction(actionResponse, fromUserId) {
    return findAction(actionResponse, function(item) {
      return item.message && item.message.fromUser && item.message.fromUser.id == fromUserId;
    });
  }

  function findUpdateInviteAction(actionResponse) {
    return findAction(actionResponse, function(item) {
      return item.id.substring(0, 7) == "inv-upd";
    });
  }

  function cancelInvitation(id, userId) {
    return client.makeRequest("DELETE", "/api/invites/" + id).asUser(userId);
  }

  function cancelInvitationOk(id, userId) {
    return cancelInvitation(id, userId).getJson();
  }

  function cancelInvitationError(id, userId, expectedStatusCode) {
    return cancelInvitation(id, userId).go()
    .then(function(expector) {
      expector.expectStatusCode(expectedStatusCode);
    });
  }

  function actOnInvite(action, messageId, userId) {
    return client.makeRequest("GET", "/api/messages/" + messageId + "?act=" + action).asUser(userId);
  }

  function actOnInviteOk(action, messageId, userId) {
    return actOnInvite(action, messageId, userId).getJson();
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

    return sendInvitation(sender, "blah").go()
    .then(function(expector) {
      expector.expectStatusCode(500);
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

    it("appear in sender's action list", function(done) {
      requestActionList(sender.id, true)
      .then(function(actionResponse) {
        expect(actionResponse.user).to.exist;
        expect(parseInt(actionResponse.user.id)).to.equal(sender.id);
        var actionList = actionResponse.actionItems;
        expect(actionList).to.exist;
        var updInvAction = findUpdateInviteAction(actionResponse);
        expect(updInvAction).to.exist;
        done();
      })
      .catch(done);
    });

    describe("once claimed", function() {

      var receiverActionResponse;
      var messageAction;

      beforeEach(function(done) {
        // Holder of the email account claims ticket.
        claimTicket(invite)
        .then(function(sessionCookie) {
          expect(sessionCookie).to.exist;
          return requestActionList(sessionCookie);
        })
        .then(function(actionResponse) {
          receiverActionResponse = actionResponse;
          messageAction = findMessageAction(receiverActionResponse, sender.id);
          done();
        })
        .catch(done);
      });

      it("logs in the new user", function(done) {
        // Action list is expected to contain a message from the sender.
        expect(receiverActionResponse.user).to.exist;
        expect(receiverActionResponse.user.id).to.exist;
        done();
      });

      it("deliver messages", function(done) {
        // Action list is expected to contain a message from the sender.
        expect(messageAction).to.exist;
        expect(typeof messageAction.id).to.equal("string");
        expect(messageAction.id.substring(0, 7)).to.equal("inv-rec");
        done();
      });

      describe("and accepted", function() {

        beforeEach(function(done) {
          actOnInviteOk("accept", messageAction.message.id, receiverActionResponse.user.id)
          .then(function() {
            done();
          })
          .catch(done);
        });

        it("add receiver to sender's connection list", function(done) {
          requestActionList(sender.id, true)
          .then(function(actionResponse) {
            expect(actionResponse.user).to.exist;
            expect(parseInt(actionResponse.user.id)).to.equal(sender.id);
            var actionList = actionResponse.actionItems;
            expect(actionList).to.exist;
            var greetingAction = findGreetingAction(actionResponse, receiverActionResponse.user.id);
            expect(greetingAction).to.exist;
            done();
          })
          .catch(done);
        });
      });

      describe("and rejected", function() {

        beforeEach(function(done) {
          actOnInviteOk("reject", messageAction.message.id, receiverActionResponse.user.id)
          .then(function() {
            done();
          })
          .catch(done);
        });

        it("the message is removed", function(done) {
          requestActionList(receiverActionResponse.user.id, true)
          .then(function(newActionResponse) {
            messageAction = findMessageAction(newActionResponse, sender.id);
            expect(messageAction).to.not.exist;
            done();
          })
          .catch(done);
        });

        it("does not add receiver to sender's connection list", function(done) {
          requestActionList(sender.id, true)
          .then(function(actionResponse) {
            expect(actionResponse.user).to.exist;
            expect(parseInt(actionResponse.user.id)).to.equal(sender.id);
            var actionList = actionResponse.actionItems;
            expect(actionList).to.exist;
            var greetingAction = findGreetingAction(actionResponse, receiverActionResponse.user.id);
            expect(greetingAction).to.not.exist;
            done();
          })
          .catch(done);
        });
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

      it("no longer appear in sender's action list", function(done) {
        requestActionList(sender.id, true)
        .then(function(actionResponse) {
          var updInvAction = findUpdateInviteAction(actionResponse);
          expect(updInvAction).to.not.exist;
          done();
        })
        .catch(done);
      });
    });
  });
});
