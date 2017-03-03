/* invitation.js */

const CONF = require("../conf");

const extend = require("extend");
const pug = require("pug");
const emailer = require("../connectors/email");
const models = require("../models/index");
const EmailProfile = models.EmailProfile;
const random = require("../util/random");
const Promise = require("promise");

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

// Create an EmailSessionSeed model object and optionally a Message object.
// Return a promise.
function createTicket(self) {
  return (self.assetId && self.fromUser
    ? models.Message.builder()
      .assetId(self.assetId)
      .fromUser(self.fromUser)
      .type(models.Message.INVITE_TYPE)
      .build()
    : Promise.resolve()
  ).then(function(message) {
    var emailSessionSeedBuilder = models.EmailSessionSeed.builder()
      .externalId(self.externalId)
      .email(self.toEmail)
      .expiresAt(self.expiresAt);
    if (self.fromUser) {
      emailSessionSeedBuilder.fromUser(self.fromUser);
    }
    if (message) {
      emailSessionSeedBuilder.messageId(message.id);
    }
    return emailSessionSeedBuilder.build()
    .then(function(emailSessionSeed) {
      return { ticket: emailSessionSeed, message: message };
    });
  });
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
  return createTicket(self)
  .then(function(ticketInfo) {
    return sendEmail(self)
    .then(function(emailResult) {
      return ticketInfo;
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
    // Get the sender's email address.
    return models.EmailProfile.findByUser(self.fromUser)
    .then(function(emailProfiles) {
      if (emailProfiles && emailProfiles.length) {
        self.senderEmail = emailProfiles[0].email;
      }
      return processTicket(self);
    })
  }
}

function inviteExpiresAt() {
  return dateFromNow(5);
}

function sendInvitationEmail(req, invite, ticket, email) {
  var fromUser = req.user;
  var host = req.headers.host;
  var protocol = host.match(/localhost/) ? "http:" : "https:";

  // Get the sender's email address.
  return models.EmailProfile.findByUser(fromUser)
  .then(function(emailProfiles) {
    var senderEmail;
    if (emailProfiles && emailProfiles.length) {
      senderEmail = emailProfiles[0].email;
    }
    return sendEmail({
      invite: invite,
      templateName: "templates/invitation.pug", 
      subject: "Join me on Living Connections",
      toEmail: email,
      senderEmail: senderEmail,
      fromUser: fromUser,
      url: protocol + "//" + host + "?e=" + ticket.externalId
    });
  });
}

module.exports = {
  Invitation: Invitation,
  Ticket: Ticket,
  inviteExpiresAt: inviteExpiresAt,
  sendInvitationEmail: sendInvitationEmail
};
