/* biz/actions.js */

module.exports = (function() {
  const Promise = require("promise");
  const models = require("../models/index");

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

  function byPriorityDesc(a, b) {
    return b.priority - a.priority;
  }

  function msgActionType(msg, action) {
    return msg + "-" + action;
  }

  function priorityOfMsgAction(msg, action) {
    return MSG_PRIORITY[msg] * ACTION_PRIORITY[action];
  }

  function msgActionItem(msg, action) {
    return {
      type: msgActionType(msg, action),
      priority: priorityOf(msg, action)
    }
  }

  function addItemsForAdmin(context) {
    context.actionItems.push(msgActionItem(MSG_ANNOUNCEMENT, ACTION_CREATE));
  }

  function addItemsForNormalUsers(context) {
  }

  function addItemsForAll() {
  }

  function plan() {
    var context = this;
    var userLevel = context.user.level;
    switch (userLevel) {
    case 0:
      addItemsForAdmin(context);
    case 1:
      addItemsForNormalUsers(context);
    default:
      addItemsForAll(context);
    }
    return context;
  }

  function executeAll() {
    var context = this;
    var target = context.target;
    target.actionItems = context.actionItems;
    return Promise.resolve(target);
  }

  function newFetchContext(user, target) {
    return {
      user: user,
      target: target,
      fetches: [],
      actionItems: [],
      plan: plan,
      executeAll, executeAll
    }
  }

  function fetchAllActionItems(user, target) {
    try {
      return newFetchContext(user, target).plan().executeAll();
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  // Exported
  function compileActions(user, target) {
    try {
      if (user) {
        return fetchAllActionItems(user, target);
      }
      else {
        return Promise.resolve(target);
      }
    }
    catch (e) {
      return Promise.reject(e);
    }
  }

  return {
    compileActions: compileActions
  }
})();
