// config.js

var App = require("./app");

module.exports = {
  apps: {
    "webrtc": new App({
      jqueryVersion: "3.1.1.slim.min",
      title: "WebRTC demo",
      stylesheet: "css/styles.css",
      main: "app"
    }),
    "angular": new App({
      jqueryVersion: "3.1.1.slim.min",
      title: "Angular demo",
      stylesheet: "css/styles.css",
      main: "angulardemo"
    }),
    "specs": new App({
      jqueryVersion: "3.1.1.slim.min",
      title: "Test Specs 1",
      stylesheet: "mocha/mocha.css",
      main: "specs"
    })
  },
  defaultApp: "webrtc",
  server: {
    port: 4545,
    mounts: {
      "/": "www",
      "/mocha": "./node_modules/grunt-blanket-mocha/node_modules/mocha",
      "/chai": "./node_modules/chai"
    }
  }
}
