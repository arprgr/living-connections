// cookie.js

define(function() {

  function Cookie(name) {
    this.name = name;
  }

  Cookie.prototype = {
    get: function() {
      var name = this.name;
      var value = "; " + document.cookie;
      var parts = value.split("; " + name + "=");
      if (parts.length == 2) return parts.pop().split(";").shift();
    },
    clear: function() {
      var name = this.name;
      document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }

  return Cookie;
});
