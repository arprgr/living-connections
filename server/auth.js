/* auth.js - Authentication middleware */

// Here is where sessions, users, and email profiles are managed.

const CONFIG = require("./conf");
const models = require("./models/index");
const Promise = require("promise");
const exec = require("./util/exec");

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
  return models.User.findById(userId, { includeFacebook: true });
}

// Create a new user.
function createNewUser(name, level) {
  return models.User.builder().name(name).level(level).build();
}

// Create a new email profile.
function createNewEmailProfile(user, email) {
  return models.EmailProfile.builder().email(email).user(user).build();
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
    models.Session.destroyById(request.session.id);
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

// Follow up with a just-activiated ticket (emailSessionSeed).
function closeTicket(ticket, toUser) {
  var group = [];

  // If this session seed has a message attached...
  if (ticket.message) {
    // ...deliver it.
    group.push(ticket.message.updateAttributes({
        toUserId: toUser.id
      }).catch(function(error) {
        console.error("invitation message delivery error", error);
      })
    );
  }
  
  // If this session seed has a source user...
  if (ticket.fromUser) {
    // Make a tentative connection (TODO: work out how connections work)
    group.push(models.Connection.builder()
      .userId(ticket.fromUser.id)
      .peerId(toUser.id)
      .build()
      .catch(function(error) {
        console.error("invitation connection error", error);
      })
    );
  }

  // Don't repeat.
  group.push(ticket.updateAttributes({ messageId: null, fromUserId: null })
    .catch(function(error) {
      console.error("close ticket error", error);
    })
  );

  return exec.executeGroup(group);
}

// Log in, asynchronously.
function AuthMgr_logIn(self, user) {
  // Create a session.
  return models.Session.builder().user(user).build()
  .then(function(session) {
    self.req.session = session;
    self.req.user = session.user;
    sendSessionCookie(self.res, session.externalId);
    return session;
  });
}

// A user has clicked on an invitation/ticket email.
function AuthMgr_resolveEmailSessionSeed(self, eseed) {

  return findEmailSessionSeed(eseed)
  .then(function(emailSessionSeed) {
    if (emailSessionSeed) {
      logOut(self.req);
      return (
        // Find the user by ID or by the given email address, or create one.
        ("userId" in emailSessionSeed)
          ? findUser(emailSessionSeed.userId)
          : findOrCreateUserByEmail(emailSessionSeed.email)
      )
      // Log in.
      .then(function(user) {
        return AuthMgr_logIn(self, user);
      })
      .then(function(session) {
        return closeTicket(emailSessionSeed, session.user);
      });
    }
  })
}

// I want to identify myself through Facebook.
function AuthMgr_handleFacebookLogin(self, facebookId, otherFacebookInfo) {
  return models.FacebookProfile.upsert({
    facebookId: facebookId,
    name: otherFacebookInfo.name,
    email: otherFacebookInfo.email,
    picture: otherFacebookInfo.picture
  })
  .then(function() {
    return models.FacebookProfile.findByFacebookId(facebookId);
  })
  .then(function(facebookProfile) {
    var currentUser = self.req.session && self.req.session.user;

    // Is there a user associated with this profile?
    if (facebookProfile.userId != null) {
      // If so, and it matches the already logged-in user, carry on.
      if (!currentUser || facebookProfile.userId != currentUser.id) {
        // Otherwise, start a new session with the user identified by the profile.
        return findUser(facebookProfile.userId)
        .then(function(user) {
          return AuthMgr_logIn(self, user);
        });
      }
    }
    else {
      // This is a new profile.  If there is a user logged in...
      if (currentUser) {
        // If the user already has a facebook profile, log them out.
        if (currentUser.facebookProfile) {
          logOut(self.req);
          currentUser = null;
        }
        // Otherwise, associate the new profile with the current user.
        else {
          return facebookProfile.updateAttributes({
            userId: currentUser.id
          });
        }
      }
      // Create a new user with the given profile and log them in.
      return createNewUser(facebookProfile.name || facebookProfile.email || "New User", 1)
      .then(function(user) {
        currentUser = user;
        return facebookProfile.updateAttributes({
          userId: user.id
        })
      })
      .then(function() {
        return AuthMgr_logIn(self, currentUser);
      });
    }
  });
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
