// conf.js

module.exports = {
  pug: {
    baseDir: "templates",
    compileDebug: false,
    debug: false,
  },
  pages: {
    "livconn": {
      title: "Living Connections",
      stylesheet: "css/livconn.css",
      mainModule: "appui"
    },
    "test": {
      title: "Test",
      stylesheet: "css/livconn.css",
      mainModule: "testui"
    }
  },
  defaultPage: "livconn",
  server: {
    port: 4545,
    mounts: {
      "/": "./client",
      "/www": "./www",
      "/mocha": "./node_modules/grunt-blanket-mocha/node_modules/mocha",
      "/chai": "./node_modules/chai"
    }
  }
}
