/* biz/actions.js */

const extend = require("extend");
const when = require("../util/when");
const Miner = require("./miner");
const Message = require("../models/index").Message;

const SUBJ_INVITATION = "inv";    // Ask another user to connect.
const SUBJ_GREETING = "gre";      // Say hi.  One time, immediate.
const SUBJ_REMINDER = "rem";      // A message sent at a specific time, possibly repeating.
const SUBJ_USER = "usr";          // Name and other details.
const SUBJ_PROFILE = "pro";       // About me...
const SUBJ_ANNOUNCEMENT = "ann";  // A broadcast message, usually by the administrator.

const ACTION_CREATE = "cre";       // Create a message and a wrapper for it.
const ACTION_UPDATE = "upd";       // Replace the message in a wrapper with a new one.
const ACTION_RECEIVE = "rec";      // Interact with an incoming message.

const PROPERTIES = {
  "rem": { 
    "rec": { priority: 95, },
    "cre": { priority: 66 },
    "upd": { priority: 1 }
  },
  "gre": {
    "rec": { priority: 94, },
    "cre": { priority: 70 },
    "upd": { priority: 35 }
  },
  "inv": { 
    "rec": { priority: 93, },
    "cre": { priority: 62 },
    "upd": { priority: 31 }
  },
  "ann": {
    "rec": { priority: 92, },
    "cre": { priority: 60 },
    "upd": { priority: 30 }
  },
  "pro": { 
    "cre": { priority: 40 },
    "upd": { priority: 20 }
  },
  "usr": {
    "cre": { priority: 50 },
    "upd": { priority: 10 }
  }
}

const MAX_ACTION_ITEMS = 20;

function byPriorityDesc(a, b) {
  return b.priority - a.priority;
}

function priorityOfSubjectAction(msg, action) {
  return PROPERTIES[msg][action].priority;
}

function ActionCompiler(user) {
  this.user = user;
  this.actionItems = [];
}

function findObjectId(data) {
  if (data) {
    for (var i in data) {
      if ("id" in data[i]) {
        return data[i].id;
      }
    }
  }
}

function addActionItem(compiler, msg, action, data) {
  var id = msg + "-" + action;
  var objectId = findObjectId(data);
  if (objectId) {
    id += "-" + objectId;
  }
  compiler.actionItems.push(extend({
    id: id,
    priority: priorityOfSubjectAction(msg, action)
  }, data));
}

function addConnectionItems(compiler) {
  var others = compiler.others;
  for (var userId in others) {
    var other = others[userId];
    var incomingMessage = other.incomingMessage;
    if (incomingMessage) {
      addActionItem(compiler,
        incomingMessage.type == Message.INVITE_TYPE && !other.isConnection ? SUBJ_INVITATION : SUBJ_GREETING,
        ACTION_RECEIVE, {
          // Apparently sequelize model objects are immutable.  Didn't know that!
          message: {
            id: incomingMessage.id,
            assetId: incomingMessage.assetId,
            asset: incomingMessage.asset,
            fromUser: other.user
          }
        });
    }
    else {
      addActionItem(compiler, SUBJ_GREETING, ACTION_CREATE, {
        user: other.user
      });
    }
  }
}

function addInvitationItems(compiler) {
  if (compiler.user.level <= 1 && compiler.user.name) {
    addActionItem(compiler, SUBJ_INVITATION, ACTION_CREATE);
  }
  var incomingInvitations = compiler.incomingInvitations;
  for (var i = 0; i < incomingInvitations.length; ++i) {
    var inv = incomingInvitations[i];
    addActionItem(compiler, SUBJ_INVITATION, ACTION_RECEIVE, { invite: inv });
  }
  var outgoingInvitations = compiler.outgoingInvitations;
  for (var i = 0; i < outgoingInvitations.length; ++i) {
    var inv = outgoingInvitations[i];
    addActionItem(compiler, SUBJ_INVITATION, ACTION_UPDATE, {
      invite: inv
    });
  }
}

function addProfileItems(compiler) {
  addActionItem(compiler, SUBJ_PROFILE, compiler.user.asset ? ACTION_UPDATE : ACTION_CREATE, {
    user: compiler.user
  });
  addActionItem(compiler, SUBJ_USER, compiler.user.name ? ACTION_UPDATE : ACTION_CREATE);
}

function addAnnouncementItems(compiler) {
  var isAdmin = compiler.user.level <= 0;
  if (isAdmin) {
    addActionItem(compiler, SUBJ_ANNOUNCEMENT, ACTION_CREATE);
  }
  var announcements = compiler.announcements;
  for (var i = 0; i < announcements.length; ++i) {
    var ann = announcements[i];
    if (ann.creatorId != compiler.user.id || !isAdmin) {
      addActionItem(compiler, SUBJ_ANNOUNCEMENT, isAdmin ? ACTION_UPDATE : ACTION_RECEIVE, {
        message: ann
      });
    }
  }
}

function createActionItems(compiler) {
  addConnectionItems(compiler);
  addInvitationItems(compiler);
  addAnnouncementItems(compiler);
  addProfileItems(compiler);
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
  if (!compiler.user) {
    return {};
  }
  return new Miner(compiler.user).run()
  .then(function(miner) {
    extend(compiler, miner);
    return createActionItems(compiler);
  })
  .then(function() {
    return {
      user: {
        id: compiler.user.id,
        name: compiler.user.name,
        email: compiler.emailProfile && compiler.emailProfile.email
      },
      actionItems: finalizeActionItems(compiler)
    }
  })
}

module.exports = ActionCompiler;
