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
function findEmailSessionSeed(eseed) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
    // Development backdoor.
    if (eseed.match(/u_\d+/)) {
      return Promise.resolve({ userId: eseed.substring(2) });
    }
  }
  return models.EmailSessionSeed.findByExternalId(eseed, { current: 1, deep: 1 });
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

// Got secret access key?
function hasSecretAccessKey(req) {
  var accessKey = req.headers["x-access-key"];
  if (accessKey) {
    return accessKey === CONFIG.adminKey;
  }
  return false;
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

// Transmit session ID to client.
function sendSessionCookie(res, sessionId) {
  res.cookie("s", sessionId, {
    maxAge: 2147483647,
    path: "/",
  });
}

// If the user is logged in, log out.
function logOut(request) {
  if (request.session) {
    models.Session.destroyByExternalId(request.session.id);
  }
  request.session = null;
  request.user = null;
}

//
// Class AuthMgr - a manager of user/session state.
//
function AuthMgr(req, res) {
  // Express thingies.
  this.req = req;
  this.res = res;
}

// If the request includes session identification, fetch the session and user objects.
function AuthMgr_establishSessionAndUser(self) {
  var req = self.req;

  // Sessions are persisted via cookie.
  var sessionCookie = req.cookies.s && req.cookies.s;

  return (sessionCookie ? findSession(sessionCookie) : Promise.resolve())
  .then(function(session) {
    if (session) {
      req.session = session;
      req.user = session.user;
    }
    else {
      // Should we grant this request superuser power?
      if (hasSecretAccessKey(self.req) || isLocalRequest(self.req)) {
        req.user = models.User.superuser(self.req.headers["x-effective-user"]);
      }
    }
  });
}

// Follow up with newly created session.
function AuthMgr_snapEmailSessionSeed(emailSessionSeed, toUser) {
  // All of the following updates are "fire and forget"...

  // If this session seed has a message attached...
  if (emailSessionSeed.messageId) {
    // ...deliver it.
    models.Message.findById(emailSessionSeed.messageId)
    .then(function(message) {
      if (message) {
        message.toUserId = toUser.id;
      }
    });
  }
  
  // If this session seed has a source user...
  if (emailSessionSeed.fromUserId) {
    // Make a tentative connection (TODO: work out how connections work)
    models.Connection.builder()
      .userId(emailSessionSeed.fromUserId)
      .peerId(toUser.id)
      .build();
  }

  // Don't repeat.
  emailSession.updateAttributes({ messageId: null, fromUserId: null });
}

// A user has clicked on an invitation/ticket email.
function AuthMgr_resolveEmailSessionSeed(self, eseed) {

  return findEmailSessionSeed(eseed).then(function(emailSessionSeed) {
    if (emailSessionSeed) {
      logOut(self.req);
      return (
        // Find the user by ID or by the given email address, or create one.
        ("userId" in emailSessionSeed)
          ? findUser(emailSessionSeed.userId)
          : findOrCreateUserByEmail(emailSessionSeed.email)
      )
      // Log in.
      .then(createSessionForUser)
      .then(function(session) {
        sendSessionCookie(self.res, session.externalId);
        snapEmailSessionSeed(emailSessionSeed, session.user);
      });
    }
  })
}

// I want to identify myself through Facebook.
function AuthMgr_handleFacebookLogin(self, facebookId, otherFacebookInfo) {
  return Promise.resolve(otherFacebookInfo);
}

AuthMgr.prototype = {
  establishSessionAndUser: function() {
    return AuthMgr_establishSessionAndUser(this);
  },
  resolveEmailSessionSeed: function(eseed) {
    return AuthMgr_resolveEmailSessionSeed(this, eseed);
  },
  handleFacebookLogin: function(facebookId, otherFacebookInfo) {
    return AuthMgr_handleFacebookLogin(this, facebookId, otherFacebookInfo);
  }
}

module.exports = AuthMgr;
