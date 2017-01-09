/* auth.js - Authentication middleware */

// Here is where sessions, users, and email profiles are managed.

const CONFIG = require("./conf");
const models = require("./models/index");
const Promise = require("promise");

// Look up a session given its external ID, maybe from a cookie.
function findSession(externalId) {
  return models.Session.findByExternalId(externalId);
}

// Look up a session seed, given an email address.
function findEmailSessionSeed(externalId) {
  return models.EmailSessionSeed.findCurrentByExternalId(externalId);
}

// Look up an email profile, given a email address.
function findEmailProfile(email) {
  return models.EmailProfile.findByEmail(email);
}

// Find user by ID
function findUser(userId) {
  return models.User.findById(userId);
}

// Create a new user.
function createNewUser(name, level) {
  return models.User.builder().name(name).level(level).build();
}

// Create a new email profile.
function createNewEmailProfile(user, email) {
  return models.EmailProfile.builder().email(email).user(user).build();
}

// Create a session.
function createSessionForUser(user) {
  return models.Session.builder().user(user).build();
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
      return createNewEmailProfile(user, email)
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

  // Email session seeds appear in the query string, usually in a link to the index page.
  this.eseed = req.query && req.query.e;
}

// If the request includes session identification, fetch the session and user objects.
function AuthMgr_lookupSession(self) {
  if (self.sessionCookie) {
    return findSession(self.sessionCookie).then(function(session) {
      self.session = session;
      return self;
    });
  }
  return Promise.resolve(self);
}

// If the request refers to an email session seed, fetch the EmailSessionSeed object.
function AuthMgr_lookupEmailSessionSeed(self) {
  if (self.eseed) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
      if (self.eseed.match(/u\d+/)) {
        self.emailSessionSeed = { userId: self.eseed.substring(1) }
        return self;
      }
    }
    return findEmailSessionSeed(self.eseed).then(function(emailSessionSeed) {
      self.emailSessionSeed = emailSessionSeed;
      return self;
    });
  }
  return Promise.resolve(self);
}

// Transmit session ID to client.
function sendSessionCookie(res, sessionId) {
  res.cookie("s", sessionId, {
    maxAge: 2147483647,
    path: "/",
  });
}

// If the user is logged in, log out.
function AuthMgr_logOut(self) {
  if (self.session) {
    models.Session.destroyByExternalId(self.session.id);
    self.session = null;
  }
}

// Follow up with newly created session.
function AuthMgr_initiateSession(self, session) {
  self.session = session;

  sendSessionCookie(self.res, session.externalId);

  // If user was invited, send the invitation message.
  // TODO: move this into a biz logic module.
  var emailSessionSeed = self.emailSessionSeed;
  if (emailSessionSeed.assetId && emailSessionSeed.fromUserId) {
    // Fire and forget.
    models.Message.builder().seed(emailSessionSeed).toUser(self.user).build();
  }
}

function AuthMgr_resolveSeed(self) {
  // If a user has clicked on an invitation/ticket email:
  var sessionSeed = self.emailSessionSeed;
  if (sessionSeed) {
    AuthMgr_logOut(self);
    return (
      // Find the user by ID or by the given email address, or create one.
      ("userId" in sessionSeed) ? findUser(sessionSeed.userId) : findOrCreateUserByEmail(sessionSeed.email)
    )
    // Log in.
    .then(createSessionForUser)
    // Carry out any necessary side effects.
    .then(function(session) {
      AuthMgr_initiateSession(self, session);
    }).then(function() {
      return self;
    });
  }
  // Nothing to do.
  return Promise.resolve(self);
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
  resolveSeed: function() {
    return AuthMgr_resolveSeed(this);
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
    return tx.resolveSeed();
  })
  .then(function(tx) {
    if (tx.session) {
      req.session = tx.session;
      req.user = tx.session.user;
    }
    else if (tx.isSuperUser()) {
      // TODO: lock down this potential security hole.
      req.user = models.User.superuser();
    }
    next();
  })
  .catch(next);
}
