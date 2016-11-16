/* index.js */

const CONFIG = require("./conf");

// Create server.
var express = require("express");
var server = express();

// Mount static asset directories.
for (var mkey in CONFIG.server.mounts) {
  server.use(mkey, express.static(CONFIG.server.mounts[mkey]));
}

// Add POST body parsers.
var bodyParser = require("body-parser");
server.use(bodyParser.json({ limit: '1mb' }));
server.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

// Add cookie parser.
var cookieParser = require("cookie-parser");
server.use(cookieParser());

// Index page.
var pageFunction = (function() {
  var pug = require("pug");
  return pug.compileFile("templates/page.pug", CONFIG.pug);
})();
server.get("/", function(request, response) {
  response.set("Content-Type", "text/html");
  response.send(pageFunction(CONFIG.pages.livconn));
});

// Routers.
server.use("/users", require("./routers/users"));
server.use("/sessions", require("./routers/sessions"));
server.use("/assets", require("./routers/assets"));
server.use("/emailprofiles", require("./routers/emailprofiles"));
server.use("/a", require("./routers/action"));

var port = process.env.PORT || CONFIG.server.port;
server.set("port", port);
server.listen(port, function () {
  console.log("Listening on port", port);
});
