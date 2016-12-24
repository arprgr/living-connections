/* biz/miner.js */

// Get everything relevant about a user at the moment.

const Promise = require("promise");
const models = require("../models/index");
const exec = require("../util/exec");

const MAX_OF_ANY_ONE_TYPE = 10;

function includeAsset() {
  return {
    model: models.Asset,
    as: "asset",
    attributes: [ "url" ]
  }
}

function includeUser(associationName) {
  return {
    model: models.User,
    as: associationName,
    attributes: [ "id", "name" ],
    include: [ includeAsset() ]
  }
}

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
  return models.Message.findByToUserId(miner.user.id, {
    include: [
      includeAsset(), 
      includeUser("fromUser")
    ],
    limit: MAX_OF_ANY_ONE_TYPE,
    order: [ [ "createdAt", "DESC" ] ]
  })
  .then(function(incomingMessages) {
    miner.incomingMessages = incomingMessages || [];
  })
}

function getOutgoingMessages(miner) {
  return models.Message.findByFromUserId(miner.user.id, {
    include: [
      includeAsset(), 
      includeUser("toUser")
    ],
    limit: MAX_OF_ANY_ONE_TYPE,
    order: [ [ "createdAt", "DESC" ] ]
  })
  .then(function(outgoingMessages) {
    miner.outgoingMessages = outgoingMessages || [];
  })
}

function getAnnouncements(miner) {
  return models.Announcement.findByDate(new Date(), {
    include: [
      includeAsset(),
      includeUser("creator")
    ],
    limit: MAX_OF_ANY_ONE_TYPE,
    order: [ [ "startDate", "DESC" ] ]
  })
  .then(function(announcements) {
    miner.announcements = announcements || [];
  })
}

function getConnections(miner) {
  return models.Connection.findByUserId(miner.user.id, {
    include: [{
      model: models.User,
      as: "peer",
      required: true
    }],
    limit: MAX_OF_ANY_ONE_TYPE,
    order: [ [ "grade", "DESC" ] ]
  })
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
