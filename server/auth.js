/* auth.js */

const models = require("./models/index");
const random = require("./util/random");

function findSession(externalId) {
  return models.Session.findByExternalId(externalId);
}

function findUserForSession(session) {
  return models.User.findById(session.UserId);
}

function findAdminUsers() {
  return models.User.findByLevel(0);
}

function findEmailProfile(emailAddress) {
  return models.EmailProfile.findByEmail(emailAddress);
}

function createNewSession(externalId, userId) {
  return models.Session.create({
    externalId: externalId,
    UserId: userId
  });
}

function randomDigits(len) {
  return random.digits(len, 62);
}

function generateSessionId() {
  return randomDigits(8) + "-" + randomDigits(12) + "-" + randomDigits(12);
}

function isLocalRequest(request) {
  var clientAddress = request.headers["x-forwarded-for"] || request.connection.remoteAddress;
console.log(clientAddress);
  return clientAddress == "127.0.0.1" || clientAddress == "::1";
}

// Exported middleware function.
function resolveSessionAndUser(request, response, next) {
  var sessionId = request.cookies.s;
  if (sessionId) {
    findSession(sessionId)
    .then(function(session) {
      request.session = session;
      return findUserForSession(session);
    }).then(function(user) {
      request.user = user;
      next();
    })
    .catch(next);
  }
  else if (isLocalRequest(request)) {
    return findAdminUsers()
    .then(function(users) {
      if (users.length) {
        request.user = users[0];
      }
      next();
    })
    .catch(next);
  }
  else {
    next();
  }
}

// Exported function.
function logInWithEmail(emailAddress, request) {
  console.log("logInWithEmail", emailAddress);
  return findEmailProfile(emailAddress)
  .then(function(emailProfile) {
    if (!emailProfile) {
      throw new Error("Login failed");
    }
    return createNewSession(generateSessionId(), emailProfile.UserId);
  })
  .then(function(session) {
    request.session = session;
    return findUserForSession(session);
  })
  .then(function(user) {
    request.user = user;
  })
}

/***
const email = require("../util/email");
email.send({
  to: emailAddress,
  subject: "Living Connections",
  text: "\n\nTesting, testing.\n\n"
})
.then(function(what) {
  console.log(what);
})
.catch(function(what) {
  console.log(what);
});
reject("Your invitation has been sent. Check your email.");
***/

module.exports = {
  resolveSessionAndUser: resolveSessionAndUser,
  logInWithEmail: logInWithEmail
}
