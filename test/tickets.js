const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("ticketing system", function(client) {

  // Methods...

  function requestTicket(email) {
    return client.makeRequest("GET", "/l?email=" + email).expectStatusCode(200).getJson().go();
  }

  function sendInvitation(fromUserId, assetId, email) {
    return client.makeRequest("POST", "/api/invites")
    .asUser(fromUserId)
    .withData({
      assetId: assetId,
      email: email
    }).expectStatusCode(200).getJson().go();
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

  function createUser(name) {
    return client.makeRequest("POST", "/api/users").withData({ name: name }).asRoot().expectStatusCode(200).getJson().go()
  }

  function cancelInvitationOk(id, userId) {
    return client.makeRequest("DELETE", "/api/invites/" + id).asUser(userId).expectStatusCode(200).getJson().go();
  }

  function cancelInvitationError(id, userId, expectedStatusCode) {
    return client.makeRequest("DELETE", "/api/invites/" + id).asUser(userId).expectStatusCode(expectedStatusCode).go();
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

  // Tests...

  it("generates ticket", function(done) {
    var TEST_EMAIL = "test@example.com";
    requestTicket(TEST_EMAIL)
    .then(function(ticket) {
      expect(ticket.externalId).to.exist;
      expect(typeof ticket.externalId).to.equal("string");
      expect(ticket.externalId.length).to.be.above(8);
      expect(ticket.email).to.equal(TEST_EMAIL);
      done();
    })
    .catch(done);
  });

  it("generates invitation", function(done) {
    var TEST_EMAIL = "test@example.com";
    var TEST_USER_ID = 4;
    var TEST_ASSET_ID = 6;
    sendInvitation(TEST_USER_ID, TEST_ASSET_ID, TEST_EMAIL)
    .then(function(invite) {
      expect(invite.fromUserId).to.equal(TEST_USER_ID);
      expect(invite.assetId).to.equal(TEST_ASSET_ID);
      expect(invite.email).to.equal(TEST_EMAIL);
      done();
    })
    .catch(done);
  });

  it("logs user in when ticket is claimed", function(done) {
    requestTicket("ech@ech.net")
    .then(function(ticket) {
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      return requestActionList(sessionCookie);
    })
    .then(function(actionResponse) {
      expect(actionResponse.user).to.exist;
      done();
    })
    .catch(done);
  });

  it("voids invitation when claimed", function(done) {
    var originalTicket;
    sendInvitation(1, 1, "ech@ech.net")
    .then(function(ticket) {
      originalTicket = ticket;
      return claimTicket(ticket);
    })
    .then(function() {
      return retrieveTicket(originalTicket.id);
    })
    .then(function(ticket) {
      expect(ticket.id).to.equal(originalTicket.id);
      expect(ticket.externalId).to.equal(originalTicket.externalId);
      expect(ticket.messageId).to.not.exist;
      expect(ticket.fromUserId).to.be.null;
      done();
    })
    .catch(done);
  });

  it("enforces one user per email address", function(done) {
    var user1;
    requestTicket("james@ech.net")
    .then(function(ticket) {
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      return requestActionList(sessionCookie);
    })
    .then(function(actionResponse) {
      user1 = actionResponse.user.id;
      return requestTicket("james@ech.net")
    })
    .then(function(ticket) {
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      return requestActionList(sessionCookie);
    })
    .then(function(actionResponse) {
      user2 = actionResponse.user.id;
      expect(user1).to.equal(user2);
      done();
    })
    .catch(done);
  });

  it("enforces one user per email address", function(done) {
    var user1;
    requestTicket("james@ech.net")
    .then(function(ticket) {
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      return requestActionList(sessionCookie);
    })
    .then(function(actionResponse) {
      user1 = actionResponse.user.id;
      return requestTicket("james@ech.net")
    })
    .then(function(ticket) {
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      return requestActionList(sessionCookie);
    })
    .then(function(actionResponse) {
      user2 = actionResponse.user.id;
      expect(user1).to.equal(user2);
      done();
    })
    .catch(done);
  });

  it("delivers invitation message", function(done) {
    // Requires sender to be a real user.
    var sender;
    createUser("Jack")
    .then(function(user) {
      sender = user;
      // The user sends an invitation to an email address.
      return sendInvitation(sender.id, 1, "ech@ech.net")
    })
    .then(function(ticket) {
      // Holder of the email account clicks the link, is logged in and redirected.
      return claimTicket(ticket);
    })
    .then(function(sessionCookie) {
      // Holder of the email account views action list.
      return requestActionList(sessionCookie);
    })
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

  describe("invite cancellation", function(done) {
    var sender;
    var ticket;

    before(function(done) {
      // There is a user...
      createUser("Jake")
      .then(function(user) {
        sender = user;
        // The user sends an invitation to an email address.
        return sendInvitation(sender.id, 2, "james@ech.net")
      })
      .then(function(_ticket) {
        ticket = _ticket;
        // The user cancels the invitation before it is received.
        return cancelInvitationOk(ticket.id, sender.id);
      })
      .then(function() {
        done();
      })
      .catch(done);
    });

    it("does not void the ticket, but prevents delivery of the message", function(done) {
      // Holder of the email account clicks the link, is logged in and redirected.
      claimTicket(ticket)
      .then(function(sessionCookie) {
        expect(sessionCookie).to.exist;
        // Holder of the email account views action list.
        return requestActionList(sessionCookie);
      })
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
