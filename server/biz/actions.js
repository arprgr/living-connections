/* biz/actions.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");
  
  // Exported
  function compileActions(userId, target) {
    return new Promise(function(resolve, reject) {
      if (userId) {
        target.actionItems = [];
        resolve(target);
      }
      else {
        resolve(target);
      }
    })
  }

  return {
    compileActions: compileActions
  }
})();
