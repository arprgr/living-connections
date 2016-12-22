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
server.use(bodyParser.json({ limit: '100kb' }));
server.use(bodyParser.urlencoded({
  limit: '100kb',
  extended: true
}));
server.use(bodyParser.raw({
  inflate: true,
  limit: "10mb",
  type: "video/*"
}));

// Add middleware.
server.use(require("cookie-parser")());
server.use(require("./auth"));
server.use(require("./jsonish"));

// Index page.
var pug = require("pug");
server.get("/", function(request, response) {
  // Recompile every time, because why not?
  var pageFunction = pug.compileFile("templates/page.pug", CONFIG.pug);
  response.set("Content-Type", "text/html");
  response.send(pageFunction(CONFIG.pages.livconn));
});

// Routers.
server.use("/a", require("./routers/alpha"));
server.use("/l", require("./routers/login"));
server.use("/o", require("./routers/omega"));
server.use("/admin", require("./routers/admin"));
for (var type in {
  "announcements": 1,
  "assets": 1,
  "connections": 1,
  "emailprofiles": 1,
  "emailsessionseeds": 1,
  "messages": 1,
  "sessions": 1,
  "users": 1
}) {
  server.use("/" + type, require("./routers/" + type));
}

var port = process.env.PORT || CONFIG.server.port;
server.set("port", port);
server.listen(port, function () {
  console.log("Listening on port", port);
});
