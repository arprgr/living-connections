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
  self.others = {};
}

function getEmailProfile(miner) {
  return models.EmailProfile.findByUser(miner.user)
  .then(function(emailProfiles) {
    if (emailProfiles && emailProfiles.length) {
      miner.emailProfile = emailProfiles[0];
    }
  });
}

function openOther(miner, user) {
  if (!(user.id in miner.others)) {
    miner.others[user.id] = {};
  }
  var other = miner.others[user.id];
  other.user = user;
  return other;
}

function getAnnouncements(miner) {
  return ((miner.user.level <= 0)
    ? models.Message.findAnnouncements()
    : models.Message.findCurrentAnnouncementsForUser(miner.user.id)
  )
  .then(function(announcements) {
    return miner.announcements = announcements || [];
  });
}

function getConnections(miner) {
  return models.Connection.findByUserId(miner.user.id)
  .then(function(connections) {
    if (connections) {
      for (var i = 0; i < connections.length; ++i) {
        var conn = connections[i];
        openOther(miner, conn.peer).isConnection = true;
      }
    }
    return null;
  });
}

function getOutgoingInvitations(miner) {
  return models.Invite.findByFromUserId(miner.user.id, { deep: 1 })
  .then(function(invites) {
    return miner.outgoingInvitations = invites || [];
  })
}

function getIncomingMessages(miner) {
  return models.Message.findByReceiver(miner.user.id, { deep: 1 })
  .then(function(messages) {
    if (messages) {
      for (var i = 0; i < messages.length; ++i) {
        var msg = messages[i];
        var other = openOther(miner, msg.fromUser);
        if (!other.incomingMessage) {
          other.incomingMessage = msg;
        }
      }
    }
    return null;   // avoid dangling promise warnings
  });
}

Miner.prototype.run = function() {
  var miner = this;
  return exec.executeGroup(miner, [
    getEmailProfile,
    getAnnouncements,
    getConnections,
    getOutgoingInvitations,
    getIncomingMessages
  ])
}

module.exports = Miner;
