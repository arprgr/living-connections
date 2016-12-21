/* util/exec.js */

module.exports = (function() {

  const Promise = require("promise");
  const nodemailer = require("nodemailer");
  const mailgun = require("nodemailer-mailgun-transport");

  const emailFrom = "admin@livingcx.com";

  const auth = {
    auth: {
      api_key: "key-1a42bcc21a15252b0de1fc4ab0540863",
      domain: "sandboxd9cba0aefb144d048bd0592ac8ea3585.mailgun.org"
    }
  }

  function send(options) {

    return new Promise(function(resolve, reject) {

      nodemailer.createTransport(mailgun(auth)).sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        text : options.text
      }, function(error, info) {
        if (error) {
          reject(error);
        }
        else {
          resolve(info);
        }
      });
    });
  }

  return {
    send: send
  }
})();
