// config.js

module.exports = {
  pug: {
    baseDir: "templates",
    compileDebug: false,
    debug: false,
  },
  pages: {
    "webrtc": {
      title: "WebRTC demo",
      stylesheet: "css/styles.css",
      mainModule: "app"
    },
    "livconn": {
      title: "Living Connections",
      stylesheet: "css/livconn.css",
      mainModule: "livconn"
    }
  },
  defaultPage: "livconn",
  server: {
    port: 4545,
    mounts: {
      "/assets": "assets",
      "/css": "css",
      "/js": "js",
      "/js/lib": "lib",
      "/mocha": "./node_modules/grunt-blanket-mocha/node_modules/mocha",
      "/chai": "./node_modules/chai"
    }
  }
}
