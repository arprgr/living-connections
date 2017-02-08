const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("ticketing system", function(client) {

  after(function(done) {
    client.wipe()
    .then(function() {
      done();
    })
    .catch(done);
  });

  function requestTicket(email) {
    return client.makeRequest("GET", "/l?email=" + email).expectStatusCode(200).getJson().go();
  }

  function claimTicket(ticket) {
    return client.makeRequest("GET", "/?e=" + ticket.externalId).expectRedirect("/").getSetCookie("s").go();
  }

  function requestActionList(sessionCookie) {
    return client.makeRequest("GET", "/a").withCookie("s", sessionCookie).expectStatusCode(200).getJson().go();
  }

  // The tests...

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
});
