/* jsonish.js */

// Middleware for easy JSON responses.

// Error reporting.
function jsonError(err) {
  var self = this;
  console.error(err);
  if (err.stack) {
    console.error(err.stack);
  }
  self.status(err.status || 500);
  self.json(err.body || {});
}

function jsonResultOf(promise) {
  var self = this;
  promise.then(function(model) {
    self.json(model);
  }).catch(function(err) {
    self.jsonError(err);
  });
}

module.exports = function(req, res, next) {
  // Embellish the response object.
  res.jsonError = jsonError;
  res.jsonResultOf = jsonResultOf;
  next();
}
