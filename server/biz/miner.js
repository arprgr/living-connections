/* biz/miner.js */

// Get everything relevant about a user at the moment.

const models = require("../models/index");
const exec = require("../util/exec");

const MAX_OF_ANY_ONE_TYPE = 10;

function Miner(user) {
  var self = this;
  self.user = user;
  self.announcements = [];
  self.outgoingInvitations = [];
  self.connections = [];
}

function getAnnouncements(miner) {
  return ((miner.user.level <= 0)
    ? models.Message.findAnnouncements()
    : models.Message.findCurrentAnnouncementsForUser(miner.user.id)
  )
  .then(function(announcements) {
    miner.announcements = announcements || [];
  });
}

function getOutgoingInvitations(miner) {
  return models.EmailSessionSeed.findByFromUserId(miner.user.id, { deep: 1 })
  .then(function(invites) {
    miner.outgoingInvitations = invites || [];
  })
}

function makeMessageQuery(connection) {
  return function() {
    return models.Message.findByUserIds(connection.peerId, connection.userId, { limit: 1 })
    .then(function(messages) {
      if (messages && messages.length) {
        connection.latestMessage = messages[0];
      }
    });
  }
}

function makeReciprocalConnectionQuery(connection) {
  return function() {
    return models.Connection.findByUserAndPeerIds(connection.peerId, connection.userId)
    .then(function(recip) {
      if (recip) {
        connection.reciprocal = true;
      }
    });
  };
}

function makePerConnectionQueries(connections) {
  var group = [];
  for (var i in connections) {
    group.push(makeReciprocalConnectionQuery(connections[i]));
    group.push(makeMessageQuery(connections[i]));
  }
  return group;
}

function getConnections(miner) {
  return models.Connection.findByUserId(miner.user.id)
  .then(function(connections) {
    miner.connections = connections || [];
    return exec.executeGroup(miner, makePerConnectionQueries(miner.connections));
  })
}

Miner.prototype.run = function() {
  var miner = this;
  return exec.executeGroup(miner, [
    getAnnouncements,
    getConnections,
    getOutgoingInvitations
  ])
}

module.exports = Miner;
