/* server.js */

const CONFIG = require("./config");
const pug = require("pug");

function newServer() {
  var express = require("express");
  var server = express();
  for (var mkey in CONFIG.server.mounts) {
    server.use(mkey, express.static(CONFIG.server.mounts[mkey]));
  }
  return server;
}

var pageFunction = pug.compileFile("templates/page.pug", CONFIG.pug);

function handlePage(request, response) {
  var pages = CONFIG.pages;
  var pageKey = request.params.page || CONFIG.defaultPage;
  if (!(pageKey in pages)) {
    response.sendStatus(404);
  }
  else {
    response.set("Content-Type", "text/html");
    response.send(pageFunction(pages[pageKey]));
  }
}

(function() {
  var server = newServer();

  var port = process.env.PORT || CONFIG.server.port;
  server.set("port", port);

  server.get("/", handlePage);
  server.get("/pages/:page", handlePage);

  server.listen(port, function () {
    console.log("Listening on port", port);
  });
})();
