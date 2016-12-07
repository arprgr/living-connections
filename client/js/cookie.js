// cookie.js

define(function() {

  function Cookie(name) {
    this.name = name;
  }

  function get() {
    var name = this.name;
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  function clear() {
    var name = this.name;
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  Cookie.prototype = {
    get: get,
    clear: clear
  }

  return Cookie;
});
