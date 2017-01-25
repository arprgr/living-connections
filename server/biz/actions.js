/* biz/actions.js */

const extend = require("extend");
const when = require("../util/when");
const Miner = require("./miner");
const Message = require("../models/index").Message;

const MSG_INVITATION = "inv";      // Ask another user to connect.
const MSG_GREETING = "gre";        // Say hi.  One time, immediate.
const MSG_REMINDER = "rem";        // A message sent at a specific time, possibly repeating.
const MSG_PROFILE = "pro";         // Who am I?
const MSG_ANNOUNCEMENT = "ann";    // A broadcast message, usually by the administrator.

const ACTION_CREATE = "cre";       // Create a message and a wrapper for it.
const ACTION_UPDATE = "upd";       // Replace the message in a wrapper with a new one.
const ACTION_RECEIVE = "rec";      // Interact with an incoming message.

const MESSAGES = {
  "inv": { priority: 11, what: "an invitation" },
  "gre": { priority: 7, what: "a greeting" },
  "rem": { priority: 13, what: "a reminder" },
  "pro": { priority: 5, what: "your profile message" },
  "ann": { priority: 3, what: "an announcement" }
}

const ACTIONS = {
  "cre": { priority: 2, verbage: function(msgType) {
    return msgType == MSG_PROFILE ? "Create" : "Send"
  } },
  "upd": { priority: 1, verbage: function() { return "Update" } },
  "rec": { priority: 4, verbage: function() { return "View" } }
}

const MAX_ACTION_ITEMS = 20;

function byPriorityDesc(a, b) {
  return b.priority - a.priority;
}

function priorityOfMsgAction(msg, action) {
  var fudge = 0;
  if (msg == MSG_PROFILE && action == ACTION_CREATE) {
    msg = MSG_INVITATION;
    fudge = 1;
  }
  return MESSAGES[msg].priority * ACTIONS[action].priority + fudge;
}

function ActionCompiler(user) {
  this.user = user;
  this.actionItems = [];
}

function addActionItem(compiler, msg, action, data) {
  var id = msg + "-" + action;
  if (arguments.length > 4) {
    id += "-" + arguments[3];
  }
  var data = arguments.length > 3 ? arguments[arguments.length - 1] : undefined;
  compiler.actionItems.push(extend({
    id: id,
    priority: priorityOfMsgAction(msg, action)
  }, data));
}

function addInvitationItems(compiler) {
  if (compiler.user.level <= 1) {
    addActionItem(compiler, MSG_INVITATION, ACTION_CREATE);
  }
}

function addGreetingItems(compiler) {
  var connections = compiler.connections;
  for (var i = 0; i < connections.length; ++i) {
    var conn = connections[i];
    addActionItem(compiler, MSG_GREETING, ACTION_CREATE);
  }
}

function addProfileItems(compiler) {
  addActionItem(compiler, MSG_PROFILE, compiler.user.asset ? ACTION_UPDATE : ACTION_CREATE, {
    user: compiler.user
  });
}

function addAnnouncementItems(compiler) {
  var isAdmin = compiler.user.level <= 0;
  if (isAdmin) {
    addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_CREATE);
  }
  var announcements = compiler.announcements;
  for (var i = 0; i < announcements.length; ++i) {
    var ann = announcements[i];
    if (ann.creatorId != compiler.user.id || !isAdmin) {
      addActionItem(compiler, MSG_ANNOUNCEMENT, isAdmin ? ACTION_UPDATE : ACTION_RECEIVE, ann.id, {
        message: ann
      });
    }
  }
}

function userIsConnection(compiler, user) {
  var connections = compiler.connections;
  for (var i = 0; i < connections.length; ++i) {
    var conn = connections[i];
    if (conn.peer.id == user.id) {
      return true;
    }
  }
  return false;
}

function addIncomingMessageItems(compiler) {
  var messages = compiler.incomingMessages;
  for (var i = 0; i < messages.length; ++i) {
    var message = messages[i];
    var what = MSG_GREETING;
    if (message.type == Message.INVITE_TYPE && !userIsConnection(compiler, message.fromUser)) {
      what = MSG_INVITATION;
    }
    addActionItem(compiler, what, ACTION_RECEIVE, message.id, { message: message });
  }
}

function createActionItems(compiler) {
  addInvitationItems(compiler);
  addGreetingItems(compiler);
  addProfileItems(compiler);
  addAnnouncementItems(compiler);
  addIncomingMessageItems(compiler);
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
