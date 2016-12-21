/* auth.js */

const models = require("./models/index");
const random = require("./util/random");

function findSession(externalId) {
  return models.Session.findByExternalId(externalId, {
    include: [{
      model: models.User,
      as: "user",
      required: true
    }]
  })
}

function findAdminUsers() {
  return models.User.findByLevel(0);
}

function findEmailProfile(emailAddress) {
  return models.EmailProfile.findByEmail(emailAddress, {
    include: [{
      model: models.User,
      as: "user",
      required: true
    }]
  })
}

function createNewSession(externalId, userId) {
  return models.Session.create({
    externalId: externalId,
    userId: userId
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
  return clientAddress == "127.0.0.1" || clientAddress == "::1";
}

// Restore session.
function resolveSessionById(sessionId, request, next) {
  // Access session, if there is one.
  findSession(sessionId)
  .then(function(session) {
    if (session) {
      request.session = session;
      request.user = session.user;
    }
    next();
  })
  .catch(next);
}

// Auto-login as admin.
// POTENTIAL SECURITY HOLE!
function autoLoginAdmin(request, next) {
  findAdminUsers()
  .then(function(users) {
    if (users.length) {
      request.user = users[0];
    }
    next();
  })
  .catch(next);
}

// Exported middleware function.
function resolveSessionAndUser(request, response, next) {
  var sessionId = request.cookies.s;
  if (sessionId) {
    resolveSessionById(sessionId, request, next);
  }
  else if (isLocalRequest(request)) {
    autoLoginAdmin(request, next);
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
      throw "Login failed";
    }
    request.user = emailProfile.user;
    return createNewSession(generateSessionId(), emailProfile.user.id);
  })
  .then(function(session) {
    request.session = session;
    return session;
  })
}

/***
const email = require("../connectors/email");
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
