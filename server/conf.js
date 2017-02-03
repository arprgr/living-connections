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
  clientServiceConfigurations: {
    apiService: {
      path: "api",
      config: {}
    },
    facebookService: {
      path: "fb",
      config: {
        appId: "1093072224140701",
        version: "v2.8"
      }
    },
    sessionManager: {
      path: "session",
      config: {
        pollingPeriod: 80000,
        retryTolerance: 3
      }
    },
    videoService: {
      path: "vid",
      config: {
        mimePriorityList: [
          "video/webm, codecs=vp9",
          "video/webm, codecs=vp8",
          "video/webm"
        ],
        timeChunk: 1000,
        bufferLimit: 100
      }
    }
  }
}

const OVERRIDES = {
  development: {
    pages: {
      "test": {
        title: "Test",
        stylesheet: "css/livconn.css",
        mainModule: "testui"
      }
    },
    clientServiceConfigurations: {
      facebookService: {
        config: {
          timeoutPeriod: 1000,
          dummy: {
            name: "James Echmalian",
            email: "ech@ech.net",
            id: 100,
            picture: "https://scontent.xx.fbcdn.net/v/t1.0-1/p100x100/11209473_10153089662479492_5130115091816741964_n.jpg?oh=f2079615854fdb6ab9850a35a3e299b4&oe=58FFC615"
          }
        }
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

var env = process.env.NODE_ENV || "production";

module.exports = extend(true, { env: env }, DEFAULTS, OVERRIDES[env]);
