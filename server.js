/* server.js */

var CONFIG = require("./config");

function newServer() {
  var express = require("express");
  var server = express();
  for (var mkey in CONFIG.server.mounts) {
    server.use(mkey, express.static(CONFIG.server.mounts[mkey]));
  }
  return server;
}

function sendApp(appKey, response) {
  var apps = CONFIG.apps;
  if (!(appKey in apps)) {
    response.sendStatus(404);
  }
  else {
    response.set("Content-Type", "text/html");
    response.send(apps[appKey].generateHtml());
  }
}

function handleAppPage(request, response) {
  var appKey = request.query.app;
  sendApp(appKey || CONFIG.defaultApp, response);
}

(function() {
  var server = newServer();

  var port = process.env.PORT || CONFIG.server.port;
  server.set("port", port);

  server.get("/pages", handleAppPage);

  server.listen(port, function () {
    console.log("Listening on port", port);
  });
})();
