/* biz/actions.js */

module.exports = (function() {
  const Promise = require("promise");
  const extend = require("extend");
  const models = require("../models/index");
  const exec = require("../util/exec");

  const MSG_INVITATION = "inv";      // Ask another user to connect.
  const MSG_GREETING = "gre";        // Say hi.  One time, immediate.
  const MSG_REMINDER = "rem";        // A message sent at a specific time, possibly repeating.
  const MSG_PROFILE = "pro";         // Who am I?
  const MSG_ANNOUNCEMENT = "ann";    // A broadcast message, usually by the administrator.

  const ACTION_CREATE = "cre";       // Create a message and a wrapper for it.
  const ACTION_UPDATE = "upd";       // Replace the message in a wrapper with a new one.
  const ACTION_REVIEW = "rev";       // Take another look at a message that you created.
  const ACTION_RECEIVE = "rec";      // Interact with an incoming message.

  const MSG_PRIORITY = {
    "inv": 9,
    "gre": 7,
    "rem": 10,
    "pro": 5,
    "ann": 8
  }

  const ACTION_PRIORITY = {
    "cre": 8,
    "upd": 4,
    "rev": 6,
    "rec": 10
  }

  const MAX_ACTION_ITEMS = 20;
  const MAX_MESSAGES = 5;

  function byPriorityDesc(a, b) {
    return b.priority - a.priority;
  }

  function msgActionType(msg, action) {
    return msg + "-" + action;
  }

  function priorityOfMsgAction(msg, action) {
    return MSG_PRIORITY[msg] * ACTION_PRIORITY[action];
  }

  function msgActionItem(msg, action, data) {
    return extend({
      type: msgActionType(msg, action),
      priority: priorityOfMsgAction(msg, action)
    }, data);
  }

  function ActionCompiler(user, target) {
    var self = this;
    self.user = user;
    self.target = target;
    self.connections = [];
    self.actionItems = [];
  }

  function fetchAssociatedData(compiler) {
    return exec.executeGroup(compiler, [
      function() {
        return models.Connection.findByUserId(compiler.user.id)
        .then(function(connections) {
          compiler.connections = connections;
        })
      }
    ]);
  }

  function addActionItem(compiler, msg, action, data) {
    compiler.actionItems.push(msgActionItem(msg, action, data));
  }

  function addItemsForAdmin(compiler) {
    addActionItem(compiler, MSG_ANNOUNCEMENT, ACTION_CREATE);
  }

  function addItemsForNormalUsers(compiler) {
    addActionItem(compiler, MSG_INVITATION, ACTION_CREATE);
  }

  function addItemsForAll(compiler) {
    var connections = compiler.connections;
    if (connections) {
      for (var i = 0; i < connections.length; ++i) {
        var conn = connections[i];
        addActionItem(compiler, MSG_GREETING, ACTION_CREATE, { peerId: conn.peerId });
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
    return new Promise(function(resolve, reject) {
      if (compiler.user) {
        fetchAssociatedData(compiler)
        .then(function() {
          return createActionItems(compiler);
        })
        .then(function() {
          return prioritizeActionItems(compiler);
        })
        .then(function() {
          resolve(compiler.actionItems);
        })
        .catch(reject);
      }
      else {
        resolve(compiler.actionItems);
      }
    });
  }

  // Exported
  function compileActions(user, target) {
    return new ActionCompiler(user).run().then(function(actionItems) {
      target.actionItems = actionItems;
      return Promise.resolve(target);
    });
  }

  return {
    compileActions: compileActions
  }
})();
