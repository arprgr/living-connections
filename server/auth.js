/* auth.js - Authentication middleware */

// Here is where sessions, users, and email profiles are managed.

const CONFIG = require("./conf");
const models = require("./models/index");
const random = require("./util/random");

// Look up a session given its external ID, maybe from a cookie.
function findSession(externalId) {
  return models.Session.findByExternalId(externalId, {
    include: [{
      model: models.User,
      as: "user",
      required: true
    }]
  })
}

// Look up a session seed, given an email address.
function findEmailSessionSeed(externalId) {
  return models.EmailSessionSeed.findByExternalId(externalId);
}

function findEmailProfile(email) {
  return models.EmailProfile.findByEmail(email, {
    include: [{
      model: models.User,
      as: "user",
      required: true
    }]
  })
}

// Create a new user.
function createNewUser(name, level) {
  return models.User.create({
    name: name,
    level: level
  });
}

// Create a new email profile.
function createNewEmailProfile(email, userId) {
  return models.EmailProfile.create({
    email: email,
    userId: userId
  });
}

// Create a session.
function createNewSession(userId) {
  return models.Session.create({
    externalId: random.id(),
    userId: userId
  });
}

// Transmit session ID to client.
function sendSessionCookie(res, sessionId) {
  res.cookie("s", sessionId, {
    maxAge: 2147483647,
    path: "/",
  });
}

function Transaction(req, res, next) {
  this.req = req;
  this.res = res;
  this.next = next;
}

Transaction.prototype = {
  hasSessionCookie: function() {
    return this.req.cookies && this.req.cookies.s;
  },
  resolveBySessionId: function() {
    var self = this;
    findSession(self.req.cookies.s)
    .then(function(session) {
      self.req.session = session;
      self.req.user = session.user;
      self.next();
    })
    .catch(self.next);
  },
  hasEmailSessionSeed: function() {
    return this.req.query && this.req.query.e;
  },
  resolveByEmailSessionSeed: function() {
    var self = this;
    var email;
    findEmailSessionSeed(self.req.query.e)
    .then(function(emailSessionSeed) {
      email = emailSessionSeed.email;
      return findEmailProfile(email);
    })
    .then(function(emailProfile) {
      if (emailProfile) {
        return Promise.resolve(emailProfile);
      }
      else {
        return createNewUser("New User", 1)
        .then(function(user) {
          return createNewEmailProfile(email, user.id);
        })
      }
    })
    .then(function(emailProfile) {
      return createNewSession(emailProfile.userId);
    })
    .then(function(session) {
      sendSessionCookie(self.res, session.externalId);
      self.req.session = session;
      self.next();
    })
    .catch(self.next);
  },
  hasInvitationId: function() {
    return false;
  },
  resolveByInvitation: function() {
    this.next();
  },
  hasAdminKey: function() {
    return this.req.headers["x-access-key"] === CONFIG.adminKey;
  },
  fromLocalHost: function() {
    // Does the request originate from the local host?
    switch (this.req.headers["x-forwarded-for"] || this.req.connection.remoteAddress) {
    case "127.0.0.1":
    case "::1":
      return true;
    }
  },
  becomeSuperUser: function() {
    // Auto-login as admin.
    // TODO: lock down this potential security hole.
    this.req.user = {
      id: 0,
      name: "Root",
      level: 0
    }
    this.next();
  }
}

//
// Authentication middeware function
// Based on request attributes, attach a user and session to the request object.
//
module.exports = function(req, res, next) {

  var transaction = new Transaction(req, res, next);

  if (transaction.hasSessionCookie()) {
    transaction.resolveBySessionId(req.cookies.s, req, next);
  }
  else if (transaction.hasEmailSessionSeed()) {
    transaction.resolveByEmailSessionSeed();
  }
  else if (transaction.hasInvitationId()) {
    transaction.resolveByInvitation();
  }
  else if (transaction.hasAdminKey() || transaction.fromLocalHost(req)) {
    transaction.becomeSuperUser();
  }
  else {
    next();
  }
}
