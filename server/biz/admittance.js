/* invitation.js */

const CONF = require("../conf");

const extend = require("extend");
const pug = require("pug");
const email = require("../connectors/email");
const EmailSessionSeed = require("../models/index").EmailSessionSeed;
const random = require("../util/random");

function dateFromNow(days) {
  return new Date(new Date().getTime() + (days * 24 * 60 * 60 * 1000));
}

function Invitation(req, options, goodForDays) {
  extend(this, options);
  this.goodForDays = goodForDays || 1;

  var externalId = random.id();
  this.externalId = externalId;

  var host = req.headers.host;
  //var protocol = req.connection.encrypted ? "https:" : "http:";
  var protocol = host.match(/localhost/) ? "http:" : "https:";
  this.url = protocol + "//" + host + "?e=" + externalId;

  var expiresAt = dateFromNow(goodForDays);
  this.expiresAtDate = expiresAt;
  this.expiresAtString = expiresAt.toString();
}

function getEmailBody(self, templateName) {
  var bodyFunction = pug.compileFile(templateName, CONF.pug);
  return bodyFunction(self);
}

function process(self, templateName) {
  var builder = EmailSessionSeed.builder()
    .externalId(self.externalId)
    .email(self.email)
    .expiresAt(dateFromNow(self.goodForDays));

  if (self.fromUser != null) {
    builder.fromUser(self.fromUser);
  }

  if (self.assetId != null) {
    builder.assetId(self.assetId);
  }

  return builder.build()
  .then(function(emailSessionSeed) {
    return email.send({
      to: self.email,
      subject: "Living Connections",
      html: getEmailBody(self, templateName)
    })
    .then(function(emailResult) {
      console.log(emailResult);
      return emailSessionSeed;
    });
  });
}

Invitation.prototype = {
  process: function(days, templateName) {
    return process(this, days, templateName);
  }
}

module.exports = {

  createInvitation: function(req, email, fromUser, assetId) {
    return new Invitation(req, {
      email: email,
      fromUser: fromUser,
      assetId: assetId
    }, 5).process("templates/invitation.pug");
  },

  createTicket: function(req, email) {
    return new Invitation(req, { email: email }).process("templates/ticket.pug");
  }
};
