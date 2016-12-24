/* auth.js - Authentication middleware */

// Here is where sessions, users, and email profiles are managed.

const CONFIG = require("./conf");
const models = require("./models/index");
const random = require("./util/random");
const Promise = require("promise");

const USER_WITH_THAT = {
  include: [{
    model: models.User,
    as: "user",
    required: true,
    include: [{
      model: models.Asset,
      as: "asset"
    }]
  }]
}

// Look up a session given its external ID, maybe from a cookie.
function findSession(externalId) {
  return models.Session.findByExternalId(externalId, USER_WITH_THAT);
}

// Look up a session seed, given an email address.
function findEmailSessionSeed(externalId) {
  return models.EmailSessionSeed.findByExternalId(externalId);
}

function findEmailProfile(email) {
  return models.EmailProfile.findByEmail(email, USER_WITH_THAT);
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

function findOrCreateUserByEmail(email) {
  return findEmailProfile(email)
  .then(function(emailProfile) {
    if (emailProfile) {
      return emailProfile.user;
    }
    return createNewUser(email, 1)
    .then(function(user) {
      return createNewEmailProfile(email, user.id)
      .then(function() {
        return user;
      });
    })
  })
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
  resolveBySessionId: function() {
    var self = this;
    var sessionId = self.req.cookies && self.req.cookies.s;
    if (sessionId) {
      return findSession(sessionId)
      .then(function(session) {
        if (session) {
          self.req.session = session;
          self.req.user = session.user;
          return true;
        }
        return false;
      })
    }
    else {
      return Promise.resolve(false);
    }
  },
  resolveByEmailSessionSeed: function() {
    var self = this;
    var eseed = self.req.query && self.req.query.e;
    if (eseed) {
      return findEmailSessionSeed(eseed)
      .then(function(emailSessionSeed) {
        if (emailSessionSeed) {
          return findOrCreateUserByEmail(emailSessionSeed.email)
          .then(function(user) {
            self.req.user = user;
            return createNewSession(user.id);
          })
          .then(function(session) {
            sendSessionCookie(self.res, session.externalId);
            self.req.session = session;
            return true;
          })
        }
        return false;
      })
    }
    else {
      return Promise.resolve(false);
    }
  },
  resolveByInvitation: function() {
    return Promise.resolve(false);
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
    var self = this;
    var success = false;
    if (self.hasAdminKey() || self.fromLocalHost()) {
      // Auto-login as admin.
      // TODO: lock down this potential security hole.
      self.req.user = {
        id: 0,
        name: "Root",
        level: 0
      }
      success = true;
    }
    return Promise.resolve(success);
  }
}

//
// Authentication middeware function
// Based on request attributes, attach a user and session to the request object.
//
module.exports = function(req, res, next) {

  var tx = new Transaction(req, res, next);

  // TODO: handle the case of following a link while session already exists.
  tx.resolveBySessionId(req.cookies.s, req, next)
  .then(function(resolved) {
    return resolved ? true : tx.resolveByEmailSessionSeed()
  })
  .then(function(resolved) {
    return resolved ? true : tx.resolveByInvitation();
  })
  .then(function(resolved) {
    return resolved ? true : tx.becomeSuperUser();
  })
  .then(function() {
    next();
  })
  .catch(next);
}
