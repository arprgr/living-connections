/* util/exec.js */

const CONFIG = require("../conf");
const Promise = require("promise");
const extend = require("extend");
const nodemailer = require("nodemailer");
const mailgun = require("nodemailer-mailgun-transport");

//const SANDBOX_DOMAIN = "sandboxd9cba0aefb144d048bd0592ac8ea3585.mailgun.org";

const auth = {
  auth: {
    api_key: CONFIG.email.apiKey,
    domain: CONFIG.email.domain
  }
}

function send(options) {

  return new Promise(function(resolve, reject) {


    if (CONFIG.email.disabled) {
      resolve({});
    }
    else {
      console.log("email", options.to, options.subject, "using", CONFIG.email.type);

      // Validate recipient.
      var to = options.to;
      if (CONFIG.email.allowedRecipients) {
        if (!CONFIG.email.allowedRecipients.includes(options.to)) {
          console.log("recipient not allowed");
          to = CONFIG.email.defaultReceipient;
        }
      }

      if (to) {
        nodemailer.createTransport(mailgun(auth)).sendMail(extend({
          from: CONFIG.email.from
        }, options), function(error, info) {
          error ? reject(error) : resolve(info);
        });
      }
      else {
        resolve({ error: "no recipient" });
      }
    }
  });
}

module.exports = {
  send: send
}
