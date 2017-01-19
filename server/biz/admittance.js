/* invitation.js */

const CONF = require("../conf");

const extend = require("extend");
const pug = require("pug");
const emailer = require("../connectors/email");
const models = require("../models/index");
const EmailProfile = models.EmailProfile;
const random = require("../util/random");

function dateFromNow(days) {
  return new Date(new Date().getTime() + (days * 24 * 60 * 60 * 1000));
}

function Ticket(req, toEmail) {
  this.toEmail = toEmail;
  this.templateName = "templates/ticket.pug";
  this.subject = "Living Connections";
  this.goodForDays = 1;
  this.externalId = random.id();

  var host = req.headers.host;
  //var protocol = req.connection.encrypted ? "https:" : "http:";
  var protocol = host.match(/localhost/) ? "http:" : "https:";
  this.url = protocol + "//" + host + "?e=" + this.externalId;

  Object.defineProperty(this, "expiresAt", {
    get: function() {
      return dateFromNow(this.goodForDays);
    }
  });

  Object.defineProperty(this, "expiresAtString", {
    get: function() {
      return this.expiresAt.toString();
    }
  });
}

function Invitation(req, toEmail, fromUser, assetId) {
  Ticket.call(this, req, toEmail);
  this.user = req.user;
  this.fromUser = fromUser;
  this.assetId = assetId;
  this.templateName = "templates/invitation.pug"; 
  this.subject = "Join me on Living Connections";
  this.goodForDays = 5;
}

// Create an EmailSessionSeed model object.
// Return a promise.
function createEmailSessionSeed(self) {
  var builder = models.EmailSessionSeed.builder()
    .externalId(self.externalId)
    .email(self.toEmail)
    .expiresAt(self.expiresAt);
  if (self.fromUser) {
    builder.fromUser(self.fromUser)
    builder.assetId(self.assetId)
  }
  return builder.build();
}

// Generate the email message and send it.
// Return a promise.
function sendEmail(self) {
  var bodyFunction = pug.compileFile(self.templateName, CONF.pug);
  var body = bodyFunction(self);

  var emailOptions = {
    to: self.toEmail,
    subject: self.subject,
    html: body
  };
  if (self.senderEmail) {
    emailOptions.from = self.fromUser.name
      ? (self.fromUser.name + " <" + self.senderEmail + ">")
      : self.senderEmail; 
    emailOptions["h:ReplyTo"] = self.senderEmail;
  }

  return emailer.send(emailOptions);
}

function processTicket(self) {
  return createEmailSessionSeed(self)
  .then(function(emailSessionSeed) {
    return sendEmail(self)
    .then(function(emailResult) {
      console.log(emailResult);
      return emailSessionSeed;
    });
  });
}

Ticket.prototype = {
  process: function() {
    return processTicket(this);
  }
}

Invitation.prototype = {
  process: function() {
    var self = this;
    return models.EmailProfile.findByUser(self.fromUser)
    .then(function(emailProfile) {
      if (emailProfile) {
        self.senderEmail = emailProfile.email;
      }
      return processTicket(self);
    })
  }
}

module.exports = {
  Invitation: Invitation,
  Ticket: Ticket
};
