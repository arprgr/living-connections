/* index.js */

const pug = require("pug");
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

// One page template serves all.
function servePage(pageConfig, response) {
  // Recompile every time, because why not?
  var pageFunction = pug.compileFile("templates/page.pug", CONFIG.pug);
  response.set("Content-Type", "text/html");
  response.send(pageFunction(pageConfig));
}

// Index page.
server.get("/", function(request, response) {
  if (request.query && request.query.e) {
    // Don't keep trying the session seed.
    response.redirect("/");
  }
  else {
    servePage(CONFIG.pages.livconn, response);
  }
});

// For testing
if (!process.env.NODE_ENV || process.env.NODE_ENV == "development") {
  server.get("/test", function(request, response) {
    servePage(CONFIG.pages.test, response);
  });
}

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
  "invites": 1,
  "messages": 1,
  "sessions": 1,
  "users": 1
}) {
  server.use("/" + type, require("./routers/" + type));
}

var port = process.env.PORT || CONFIG.server.port;
server.set("port", port);
server.listen(port, function () {
  const random = require("./util/random");
  console.log("Listening on port", port);
  CONFIG.adminKey = random.id();
  console.log(CONFIG.adminKey);
});
