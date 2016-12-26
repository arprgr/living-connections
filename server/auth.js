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

const SUPERUSER = {
  id: 0,
  name: "Root",
  level: 0
}

// Look up a session given its external ID, maybe from a cookie.
function findSession(externalId) {
  return models.Session.findByExternalId(externalId, USER_WITH_THAT);
}

// Look up a session seed, given an email address.
function findEmailSessionSeed(externalId) {
  // TODO: If the session seed is no longer valid, ignore it.
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
function createNewSession(user) {
  return models.Session.create({
    externalId: random.id(),
    userId: user.id
  }).then(function(session) {
    session.user = user;   // decorate the session with the user, just as findSession does.
    return session;
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

function Transaction(req, res, next) {
  this.req = req;
  this.res = res;
  this.next = next;

  var sessionCookie = req.cookies.s && req.cookies.s;
  this.sessionCookie = sessionCookie;
  this.sessionId = sessionCookie;

  this.eseed = req.query && req.query.e;
}

function Transaction_lookupSession(self) {
  if (self.sessionId) {
    return findSession(self.sessionId).then(function(session) {
      self.session = session;
      return self;
    });
  }
  else {
    return Promise.resolve(self);
  }
}

function Transaction_lookupEmailSessionSeed(self) {
  if (self.eseed) {
    return findEmailSessionSeed(self.eseed).then(function(emailSessionSeed) {
      self.emailSessionSeed = emailSessionSeed;
      return self;
    });
  }
  else {
    return Promise.resolve(self);
  }
}

// Transmit session ID to client.
function Transaction_sendSessionCookie(self) {
  res = self.res;
  sessionId = self.session.externalId;
  res.cookie("s", sessionId, {
    maxAge: 2147483647,
    path: "/",
  });
}

function Transaction_snapEmailSessionSeed(self) {
}

function Transaction_resolveSession(self) {
  // If a user clicks on an invitation/ticket email:
  if (self.emailSessionSeed) {
    // If the user is already logged in...
    if (self.session) {
      // Log out.
      models.Session.destroyByExternalId(self.sessionId);
      self.session = null;
    }
    // Find the user with the given email address, or create one.
    return findOrCreateUserByEmail(self.emailSessionSeed.email)
    // Log in.
    .then(createNewSession)
    .then(function(session) {
      self.session = session;
      Transaction_sendSessionCookie(self);
    })
    .then(function() {
      Transaction_snapEmailSessionSeed(self);
      return self;
    });
  }
  else {
    return Promise.resolve(self);
  }
}

// Got secret access key?
function hasSecretAccessKey(req) {
  return req.headers["x-access-key"] === CONFIG.adminKey;
}

// Does the request originate from the local host?
function isLocalRequest(req) {
  switch (req.headers["x-forwarded-for"] || req.connection.remoteAddress) {
  case "127.0.0.1":
  case "::1":
    return true;
  }
  return false;
}

// Should we grant this request access to superuser functions?
function Transaction_isSuperUser(self) {
  return hasSecretAccessKey(self.req) || isLocalRequest(self.req);
}

Transaction.prototype = {
  lookupSession: function() {
    return Transaction_lookupSession(this);
  },
  lookupEmailSessionSeed: function() {
    return Transaction_lookupEmailSessionSeed(this);
  },
  sendSessionCookie: function() {
    return Transaction_sendSessionCookie(this);
  },
  snapEmailSessionSeed: function() {
    return Transaction_snapEmailSessionSeed(this);
  },
  resolveSession: function() {
    return Transaction_resolveSession(this);
  },
  isSuperUser: function() {
    return Transaction_isSuperUser(this);
  }
}

//
// Authentication middeware function
// Based on request attributes, attach a user and session to the request object.
//
module.exports = function(req, res, next) {
  new Transaction(req, res, next).lookupSession()
  .then(function(tx) {
    return tx.lookupEmailSessionSeed();
  })
  .then(function(tx) {
    return tx.resolveSession();
  })
  .then(function(tx) {
    if (tx.session) {
      req.session = tx.session;
      req.user = tx.session.user;
    }
    else if (tx.isSuperUser()) {
      // TODO: lock down this potential security hole.
      req.user = SUPERUSER;
    }
    next();
  })
  .catch(next);
}
