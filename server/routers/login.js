/* login.js */

const email = require("../connectors/email");
const models = require("../models/index");
const random = require("../util/random");

function tomorrow() {
  return new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
}

function loginMessage(url) {
  return "<p>Click on the link below to log in to Living Connections.</p>" +
    "<p><a href='" + url + "'>" + url + "</a></p>";
}

function logInWIthEmail(req) {
  var externalId = random.id();
  var emailAddress = req.query.email;
  var protocol = req.connection.encrypted ? "https:" : "http:";
  var host = req.headers.host;
  var url = protocol + "//" + host + "?e=" + externalId;
  console.log(url);
  return models.EmailSessionSeed.create({
    externalId: externalId,
    email: emailAddress,
    expiresAt: tomorrow()
  }).then(function() {
    return email.send({
      to: emailAddress,
      subject: "Living Connections",
      html: loginMessage(url)
    })
  });
}

const router = require("express").Router();

router.get("/", function(req, res) {
  if (req.query.email) {
    res.jsonResultOf(logInWIthEmail(req));
  }
  else {
    res.jsonError({});
  }
});

module.exports = router;
