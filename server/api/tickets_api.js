/* tickets_api.js */

const models = require("../models/index");
const Ticket = models.EmailSessionSeed;
const ApiValidator = require("./api_validator");
const Promise = require("promise");

var router = require("express").Router();

// Retrieve ticket by ID
router.get("/:id", function(req, res) {
  res.jsonResultOf(Ticket.findById(req.params.id)
  .then(function(ticket) {
    if (!ticket) {
      throw { status: 404 };
    }
    return ticket;
  }));
});

// Delete ticket by ID
router.delete("/:id", function(req, res) {
  res.jsonResultOf(new Promise(function(resolve) {
    // Invitation is removed, but the ticket remains.
    resolve(Ticket.findById(req.params.id)
    .then(function(ticket) {
      if (!ticket) {
        throw { status: 404 };
      }
      if (!req.isAdmin) {
        throw { status: 401 };
      }
      return ticket.destroy();
    }));
  }));
});

if (process.env.NODE_ENV == "test") {
  // Delete all tickets
  router.delete("/", function(req, res) {
    res.jsonResultOf(Ticket.destroyAll());
  });
}

module.exports = router;
