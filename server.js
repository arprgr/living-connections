/* server.js */

var express = require("express");

var server = express();

// Static assets.
server.use(express.static("www"));

// Geo-search endpoint.
server.get("/api", function (req, res) {

  console.log("request", { uri: "/api", query: req.query });

  function ok(hits) {
    res.json({ status: "ok", results: hits });
  }

  function error(errmsg) {
    res.json({ status: "error", msg: errmsg });
  }

  var params = {
    n: parseFloat(req.query.n),
    lang: req.query.lang || "en"
  };

  if (isNaN(params.latitude)) {
    return error("latitude must be a number");
  }

  ok({});
});

var port = 8989;
server.listen(port, function () {
  console.log("Listening on port " + port);
});
