/* biz/actions.js */

const Promise = require("promise");
const extend = require("extend");
const models = require("../models/index");
const exec = require("../util/exec");
const when = require("../util/when");

const MSG_INVITATION = "inv";      // Ask another user to connect.
const MSG_GREETING = "gre";        // Say hi.  One time, immediate.
const MSG_REMINDER = "rem";        // A message sent at a specific time, possibly repeating.
const MSG_PROFILE = "pro";         // Who am I?
const MSG_ANNOUNCEMENT = "ann";    // A broadcast message, usually by the administrator.

const ACTION_CREATE = "cre";       // Create a message and a wrapper for it.
const ACTION_UPDATE = "upd";       // Replace the message in a wrapper with a new one.
const ACTION_RECEIVE = "rec";      // Interact with an incoming message.

const MESSAGES = {
  "inv": { priority: 9, what: "an invitation" },
  "gre": { priority: 7, what: "a greeting" },
  "rem": { priority: 10, what: "a reminder" },
  "pro": { priority: 5, what: "your profile message" },
  "ann": { priority: 8, what: "an announcement" }
}

const ACTIONS = {
  "cre": { priority: 8, verbage: function(msgType) {
    return msgType == MSG_PROFILE ? "Create" : "Send"
  } },
  "upd": { priority: 4, verbage: function() { return "Update" } },
  "rec": { priority: 10, verbage: function() { return "View" } }
}

const MAX_ACTION_ITEMS = 20;
const MAX_MESSAGES = 5;
const MAX_CONNECTIONS = 10;

function byPriorityDesc(a, b) {
  return b.priority - a.priority;
}

function msgActionType(msg, action) {
  return msg + "-" + action;
}

function priorityOfMsgAction(msg, action) {
  return MESSAGES[msg].priority * ACTIONS[action].priority;
}

function msgActionItem(msg, action, data) {
  return extend({
    type: msgActionType(msg, action),
    priority: priorityOfMsgAction(msg, action),
    title: ACTIONS[action].verbage(msg) + " " + MESSAGES[msg].what
  }, data);
}

function ActionCompiler(user) {
  var self = this;
  self.user = user;
  self.connections = [];
  self.actionItems = [];
}

function announcementTitle(compiler, announcement) {
  var title = "Announcement";
  if (compiler.user.id == announcement.creatorId) {
    title = "your " + title;
  }
  else { 
    if (announcement.creator) {
      title += " from " + announcement.creator.name;
    }
  }
  title += " of " + when.formatRelativeTime(announcement.startDate);
  return title;
}

function fetchAssociatedData(compiler) {
  return exec.executeGroup(compiler, [
    function() {
      return models.Connection.findByUserId(compiler.user.id, {
        include: [{
          model: models.User,
          as: "peer",
          required: true
        }],
        limit: MAX_CONNECTIONS,
        order: [ [ "grade", "DESC" ] ]
      })
      .then(function(connections) {
        compiler.connections = connections;
      })
    },
    function() {
      return models.Announcement.findByDate(new Date(), {
        include: [{
          model: models.Asset,
          as: "asset",
          attributes: [ "url" ]
        }, {
          model: models.User,
          as: "creator",
          attributes: [ "id", "name" ],
          include: [{
            model: models.Asset,
            as: "asset",
            attributes: [ "url" ]
          }]
        }],
        limit: MAX_CONNECTIONS,
        order: [ [ "startDate", "DESC" ] ]
      })
      .then(function(announcements) {
        compiler.announcements = announcements;
      })
    }
  ]);
}

function addActionItem(compiler, msg, action, data) {
  compiler.actionItems.push(msgActionItem(msg, action, data));
}

function addItemsForAdmin(compiler) {
  addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_CREATE);
  var announcements = compiler.announcements;
  if (announcements) {
    for (var i = 0; i < announcements.length; ++i) {
      var ann = announcements[i];
      addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_UPDATE, {
        title: "Update " + announcementTitle(compiler, ann),
        assetUrl: ann.asset.url
      });
    }
  }
}

function addItemsForNormalUsers(compiler) {
  // disable for now...
  // addActionItem(compiler, MSG_INVITATION, ACTION_CREATE);
}

function addItemsForAll(compiler) {
  var connections = compiler.connections;
  if (connections) {
    for (var i = 0; i < connections.length; ++i) {
      var conn = connections[i];
      addActionItem(compiler, MSG_GREETING, ACTION_CREATE, {
        title: "Send a greeting to " + conn.peer.name
      });
    }
  }
  if (!compiler.user.asset) {
    addActionItem(compiler, MSG_PROFILE, ACTION_CREATE);
  }
  else {
    addActionItem(compiler, MSG_PROFILE, ACTION_UPDATE, {
      assetUrl: compiler.user.asset.url
    });
  }
  var announcements = compiler.announcements;
  if (announcements) {
    for (var i = 0; i < announcements.length; ++i) {
      var ann = announcements[i];
      if (ann.creatorId != compiler.user.id) {
        addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_RECEIVE, {
          title: announcementTitle(compiler, ann),
          assetUrl: ann.asset.url,
          sender: ann.creator
        });
      }
    }
  }
}

function createActionItems(compiler) {
  var userLevel = compiler.user.level;
  switch (userLevel) {
  case 0:
    addItemsForAdmin(compiler);
  case 1:
    addItemsForNormalUsers(compiler);
  default:
    addItemsForAll(compiler);
  }
}

function prioritizeActionItems(compiler) {
  var actionItems = compiler.actionItems;
  actionItems.sort(function(a, b) {
    return b.priority - a.priority;
  });
  compiler.actionItems = actionItems.slice(0, MAX_ACTION_ITEMS);
  return Promise.resolve(compiler);
}

ActionCompiler.prototype.run = function() {
  var compiler = this;
  return fetchAssociatedData(compiler)
  .then(function() {
    return createActionItems(compiler);
  })
  .then(function() {
    return prioritizeActionItems(compiler);
  })
  .then(function() {
    return {
      userName: compiler.user.name,
      actionItems: compiler.actionItems
    }
  })
}

module.exports = ActionCompiler;
