const expect = require("chai").expect;
const requestlc = require("./common/requestlc");

requestlc.describe("Reminders processing", function(client) {

  const PATH = "/api/reminders";

  it("processes future reminders appropriately", function(done) {
    var deliverAt = new Date();
    deliverAt.setYear(deliverAt.getYear() + 1);
    client.makeRequest("POST", PATH).asUser(80).withData({
      deliverAt: deliverAt.toISOString(),
      assetId: 524,
      toUserId: 11,
      timeZone: "Eastern"
    }).getJson().then(function(reminder) {
      return client.makeRequest("POST", PATH + "/refresh").asRoot().getJson();
    })
    .then(function(result) {
      expect(result.activeReminders.length).to.equal(1);
      expect(result.messagesSent.length).to.equal(0);
      done();
    })
    .catch(done);
  });

  it("processes current reminders appropriately", function(done) {
    var deliverAt = new Date();
    client.makeRequest("POST", PATH).asUser(80).withData({
      deliverAt: deliverAt.toISOString(),
      assetId: 524,
      toUserId: 11,
      timeZone: "Eastern"
    }).getJson().then(function(reminder) {
      return client.makeRequest("POST", PATH + "/refresh").asRoot().getJson();
    })
    .then(function(result) {
      expect(result.activeReminders.length).to.equal(1);
      expect(result.messagesSent.length).to.equal(1);
      done();
    })
    .catch(done);
  });
});
