// assertions.js

define([ "utils", "jquery" ], function(u, jq) {

  function resolveMsg(msg) {
    if (!msg) {
      return "assertion failed";
    }
    if (typeof msg === "function") {
      return msg();
    }
    return String(msg);
  }

  function assertTruthy(condition, msg) {
    if (!condition) {
      u.trace(resolveMsg(msg));
    }
  }

  function assertUndefined(value, name) {
    assertTruthy(typeof value === "undefined", function() {
      return "Expected " + name + " to be undefined, but it is " + value;
    });
  }

  assertUndefined($, "$");

  return function() {}
});
