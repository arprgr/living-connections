/* biz/miner.js */

// Get everything relevant about a user at the moment.

const Promise = require("promise");
const models = require("../models/index");
const exec = require("../util/exec");

const MAX_OF_ANY_ONE_TYPE = 10;

function Miner(user) {
  var self = this;
  self.user = user;
  self.announcements = [];
  self.incomingMessages = [];
  self.outgoingMessages = [];
  self.incomingInvitations = [];
  self.outgoingInvitations = [];
  self.connections = [];
}

function getIncomingMessages(miner) {
  return models.Message.findByToUserId(miner.user.id)
  .then(function(incomingMessages) {
    miner.incomingMessages = incomingMessages || [];
  })
}

function getOutgoingMessages(miner) {
  return models.Message.findByFromUserId(miner.user.id)
  .then(function(outgoingMessages) {
    miner.outgoingMessages = outgoingMessages || [];
  })
}

function getAnnouncements(miner) {
  return models.Announcement.findCurrent()
  .then(function(announcements) {
    miner.announcements = announcements || [];
  })
}

function getConnections(miner) {
  return models.Connection.findByUserId(miner.user.id)
  .then(function(connections) {
    miner.connections = connections || [];
  })
}

Miner.prototype.run = function() {
  var miner = this;
  return exec.executeGroup(miner, [
    getIncomingMessages,
    getOutgoingMessages,
    getAnnouncements,
    getConnections
  ])
}

module.exports = Miner;
