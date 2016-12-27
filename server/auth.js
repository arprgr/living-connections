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

// Look up an email profile, given a email address.
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

// If there is no user having the given email address, create both the new Users
// and the new EmailProfile records.
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

//
// Class AuthMgr - an implementation class for management of user/session state.
//
function AuthMgr(req, res, next) {
  // Express thingies.
  this.req = req;
  this.res = res;
  this.next = next;

  // Sessions are persisted via cookie.
  var sessionCookie = req.cookies.s && req.cookies.s;
  this.sessionCookie = sessionCookie;
  this.sessionId = sessionCookie;

  // Email session seeds appear in the query string, usually in a link to the index page.
  this.eseed = req.query && req.query.e;
}

// If the request includes session identification, fetch the session and user objects.
function AuthMgr_lookupSession(self) {
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

// If the request refers to an email session seed, fetch the EmailSessionSeed object.
function AuthMgr_lookupEmailSessionSeed(self) {
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
function sendSessionCookie(res, sessionId) {
  res.cookie("s", sessionId, {
    maxAge: 2147483647,
    path: "/",
  });
}

// Follow up on a new user.
function AuthMgr_initiateNewUser(self) {
  sendSessionCookie(self.res, self.session.externalId);
  // TODO: move this into a biz logic module.
  var emailSessionSeed = self.emailSessionSeed;
  if (emailSessionSeed && emailSessionSeed.assetId && emailSessionSeed.fromUserId) {
    return models.Message.create({
      fromUserId: emailSessionSeed.fromUserId,
      assetId: emailSessionSeed.assetId,
      toUserId: self.session.user.id
    }).then(function() {
      return self;
    });
  }
  return self;
}

function AuthMgr_resolveSession(self) {
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
      return AuthMgr_initiateNewUser(self);
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
function AuthMgr_isSuperUser(self) {
  return hasSecretAccessKey(self.req) || isLocalRequest(self.req);
}

AuthMgr.prototype = {
  lookupSession: function() {
    return AuthMgr_lookupSession(this);
  },
  lookupEmailSessionSeed: function() {
    return AuthMgr_lookupEmailSessionSeed(this);
  },
  resolveSession: function() {
    return AuthMgr_resolveSession(this);
  },
  isSuperUser: function() {
    return AuthMgr_isSuperUser(this);
  }
}

//
// Authentication middeware function
// Based on request attributes, attach a user and session to the request object.
//
module.exports = function(req, res, next) {
  new AuthMgr(req, res, next).lookupSession()
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
