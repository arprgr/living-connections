// conf.js

const extend = require("extend");

const DEFAULTS = {
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
    }
  },
  defaultPage: "livconn",
  server: {
    port: 4545,
    mounts: {
      "/": "./client"
    }
  },
}

const OVERRIDES = {
  development: {
    pages: {
      "test": {
        title: "Test",
        stylesheet: "css/livconn.css",
        mainModule: "testui"
      }
    }
  },
  production: {
    server: {
      port: 4544,
    }
  },
  test: {
    server: {
      port: 4546,
      mounts: {
        "/mocha": "./node_modules/grunt-blanket-mocha/node_modules/mocha",
        "/chai": "./node_modules/chai"
      }
    }
  }
}

var env = process.env.NODE_ENV || "development";

module.exports = extend(true, { env: env }, DEFAULTS, OVERRIDES[env]);
