/* biz/actions.js */

const extend = require("extend");
const when = require("../util/when");
const Miner = require("./miner");

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
  "gre": { priority: 8, what: "a greeting" },
  "rem": { priority: 10, what: "a reminder" },
  "pro": { priority: 5, what: "your profile message" },
  "ann": { priority: 7, what: "an announcement" }
}

const ACTIONS = {
  "cre": { priority: 8, verbage: function(msgType) {
    return msgType == MSG_PROFILE ? "Create" : "Send"
  } },
  "upd": { priority: 4, verbage: function() { return "Update" } },
  "rec": { priority: 10, verbage: function() { return "View" } }
}

const MAX_ACTION_ITEMS = 20;

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
  this.user = user;
  this.actionItems = [];
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

function greetingTitle(compiler, message) {
  var title = "Greeting";
  if (message.fromUser) {
    title += " from " + message.fromUser.name;
  }
  return title;
}

function addActionItem(compiler, msg, action, data) {
  compiler.actionItems.push(msgActionItem(msg, action, data));
}

function addAdminAnnouncementItems(compiler) {
  addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_CREATE);

  var announcements = compiler.announcements;
  for (var i = 0; i < announcements.length; ++i) {
    var ann = announcements[i];
    addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_UPDATE, {
      title: "Update " + announcementTitle(compiler, ann),
      announcement: ann
    });
  }
}

function addInvitationItems(compiler) {
  addActionItem(compiler, MSG_INVITATION, ACTION_CREATE);
}

function addGreetingItems(compiler) {
  var connections = compiler.connections;
  for (var i = 0; i < connections.length; ++i) {
    var conn = connections[i];
    addActionItem(compiler, MSG_GREETING, ACTION_CREATE, {
      title: "Send a greeting to " + conn.peer.name
    });
  }
}

function addProfileItems(compiler) {
  if (!compiler.user.asset) {
    addActionItem(compiler, MSG_PROFILE, ACTION_CREATE);
  }
  else {
    addActionItem(compiler, MSG_PROFILE, ACTION_UPDATE, {
      assetUrl: compiler.user.asset.url
    });
  }
}

function addAnnouncementItems(compiler) {
  var announcements = compiler.announcements;
  for (var i = 0; i < announcements.length; ++i) {
    var ann = announcements[i];
    if (ann.creatorId != compiler.user.id) {
      addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_RECEIVE, {
        title: announcementTitle(compiler, ann),
        announcement: ann
      });
    }
  }
}

function addMessageItems(compiler) {
  var messages = compiler.incomingMessages;
  for (var i = 0; i < messages.length; ++i) {
    var message = messages[i];
    addActionItem(compiler, MSG_GREETING, ACTION_RECEIVE, {
      title: greetingTitle(compiler, message),
      assetUrl: message.asset.url,
      sender: message.fromUser
    });
  }
}

function createActionItems(compiler) {
  var userLevel = compiler.user.level;
  switch (userLevel) {
  case 0:
    addAdminAnnouncementItems(compiler);
  case 1:
    addInvitationItems(compiler);
  default:
    addGreetingItems(compiler);
    addProfileItems(compiler);
    addAnnouncementItems(compiler);
    addMessageItems(compiler);
  }
}

function finalizeActionItems(compiler) {
  var actionItems = compiler.actionItems;
  actionItems.sort(function(a, b) {
    return b.priority - a.priority;
  });
  return actionItems.slice(0, MAX_ACTION_ITEMS);
}

ActionCompiler.prototype.run = function() {
  var compiler = this;
  return new Miner(compiler.user).run()
  .then(function(miner) {
    extend(compiler, miner);
    return createActionItems(compiler);
  })
  .then(function() {
    return {
      user: compiler.user,
      actionItems: finalizeActionItems(compiler)
    }
  })
}

module.exports = ActionCompiler;
