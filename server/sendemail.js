/* sendemail.js */

const email = require("./connectors/email");

var TO = "ech@ech.net";
var SUBJECT = "Living Connections (test)";
var BODY = "\n\nTesting, testing.\n\n";

var params = {
  to: TO,
  subject: SUBJECT,
  text: BODY
}

console.log(params);

email.send(params)
.then(function(info) {
  console.log("Sent.");
  console.log(info);
})
.catch(function(what) {
  console.log(what);
});
