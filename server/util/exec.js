/* util/exec.js */

module.exports = (function() {
  const Promise = require("promise");

  function executeSequence(context, sequence) {
    sequence = sequence.slice();
    return new Promise(function(resolve, reject) {
      (function next(arg) {
        var f = sequence.shift();
        if (f) {
          f(context)
            .then(next)
            .catch(reject);
        }
        else {
          resolve(context);
        }
      })(context);
    });
  }

  function executeGroup(context, group) {
    group = group.slice();
    var pendingCount = 0;
    var rejected = false;
    return new Promise(function(resolve, reject) {
      for (var i = 0; i < group.length; ++i) {
        var promise = group[i](context);
        ++pendingCount;
        promise.then(function() {
          if (!rejected && --pendingCount == 0) {
            resolve(context);
          }
        })
        .catch(function(error) {
          rejected = true;
          reject(error);
        });
      }
    });
  }
  
  return {
    executeSequence: executeSequence,
    executeGroup: executeGroup
  }
})();
