/* biz/registration.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  
  function createNewUser(name, level) {
    return models.User.create({
      name: name,
      level: level
    });
  }
  
  function createNewEmailProfile(email, userId) {
    return models.EmailProfile.create({
      email: email,
      userId: userId
    });
  }

  // Exported
  function register(options, target) {
    return new Promise(function(resolve, reject) {

      var name = options.name;
      if (!name) {
        reject("name missing");
      }
      var level = typeof options.level == "number" ? options.level : 1;
      var email = options.email;
      if (!email) {
        reject("email missing");
      }

      createNewUser(name, level)
      .then(function(user) {
        target.user = user;
        return createNewEmailProfile(options.email, user.id);
      })
      .then(function(emailProfile) {
        target.emailProfile = emailProfile;
        resolve(target);
      })
      .catch(reject);
    });
  }

  return {
    register: register
  }
})();
