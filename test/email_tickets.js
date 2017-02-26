const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Email ticketing", function(client) {

  // Methods...

  function requestTicket(email) {
    return client.makeRequest("GET", "/l?email=" + email);
  }

  function requestTicketOk(email) {
    return requestTicket(email).getJson();
  }

  function claimTicketOk(ticket) {
    return client.makeRequest("GET", "/?e=" + ticket.externalId).go()
    .then(function(expector) { 
      expector.expectRedirect("/");
      return expector.getSetCookie("s");
    });
  }

  function requestActionList(sessionCookie) {
    return client.makeRequest("GET", "/a").withCookie("s", sessionCookie).getJson();
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

  it("rejects invalid email address", function(done) {
    requestTicket("blah").go()
    .then(function(expector) {
      expector.expectStatusCode(500);
      done();
    })
    .catch(done);
  });

  describe("claimed", function() {

    const TEST_EMAIL = "test@example.com";

    var ticket;
    var sessionCookie;

    beforeEach(function(done) {
      requestTicketOk(TEST_EMAIL)
      .then(function(_ticket) {
        ticket = _ticket;
        expect(ticket.externalId).to.exist;
        expect(typeof ticket.externalId).to.equal("string");
        expect(ticket.externalId.length).to.be.above(8);
        expect(ticket.email).to.equal(TEST_EMAIL);
        return claimTicketOk(ticket);
      })
      .then(function(_sessionCookie) {
        sessionCookie = _sessionCookie;
        done();
      })
      .catch(done);
    });

    it("logs user in", function(done) {
      requestActionList(sessionCookie)
      .then(function(actionResponse) {
        expect(actionResponse.user).to.exist;
        done();
      })
      .catch(done);
    });

    it("can be claimed again", function(done) {
      claimTicketOk(ticket).then(function(sessionCookie) {
        return requestActionList(sessionCookie);
      })
      .then(function(actionResponse) {
        expect(actionResponse.user).to.exist;
        done();
      })
      .catch(done);
    });

    it("enforces one user per email", function(done) {
      var user1;
      requestActionList(sessionCookie)
      .then(function(actionResponse) {
        user1 = actionResponse.user;
        return requestTicketOk(TEST_EMAIL);
      })
      .then(function(ticket) {
        return claimTicketOk(ticket);
      })
      .then(function(sessionCookie) {
        return requestActionList(sessionCookie);
      })
      .then(function(actionResponse) {
        expect(actionResponse.user.id).to.equal(user1.id);
        done();
      })
      .catch(done);
    });
  });
});
