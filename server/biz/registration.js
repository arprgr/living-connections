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
      UserId: userId
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

      createNewUser(name, level)
      .then(function(user) {
        target.user = user;

        if (options.email) {
          createNewEmailProfile(options.email, user.id)
          .then(function(emailProfile) {
            target.emailProfile = emailProfile;
            resolve(target);
          })
          .catch(reject);
        }
        else {
          reject("email missing");
        }
      })
      .catch(reject);
    });
  }

  return {
    register: register
  }
})();
