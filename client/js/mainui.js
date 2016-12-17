// mainui.js

define([ "jquery", "services", "listingui", "activityui" ],
  function($, Services, ListingController, ActivityComponent) {

  function selectContainer() {
    return $("#app");
  }

  function selectHeader() {
    return $("#app .header");
  }

  function selectActivityContainer() {
    return $("#app .activity");
  }

  // TODO: this seems the wrong place to do this.
  selectContainer()
    .append($("<div>").addClass("header"))
    .append($("<div>").addClass("listing"))
    .append($("<div>").addClass("activity"))
    .hide();

  function expandString(self, format) {
    var sessionManager = Services.sessionManager;
    var openActionItem = self.openActionItem || {};
    var stuff = {
      u: (sessionManager.user && sessionManager.user.name) || "",
      o: (openActionItem.user && openActionItem.user.name) || ""
    }
    return format.replace(/%u%/g, stuff.u).replace(/%o%/g, stuff.o);
  }

  function renderHeader(self) {
    var sessionManager = Services.sessionManager;
    var openActionItem = self.openActionItem || {};
    var title = "";
    if (sessionManager.user) {
      title = expandString(self, openActionItem.titleFormat || "");
    }
    selectHeader().empty()
      .append($("<span>")
        .addClass("title")
        .text(title))
      .append($("<a>")
        .addClass("logout")
        .text("Log out")
        .attr("href", "#")
        .click(function() {
          sessionManager.logOut();
        }));
  }

  function handleSessionManagerStateChange(self) {
    var self = this;
    renderHeader(self);
  }

  function handleActivityOpen(item) {
    var self = this;
    renderHeader(self);
    self.listingController.setVisible(0);
    self.openActionItem = item;
    self.activity = new ActivityComponent(selectActivityContainer(), item)
      .onActivityClose(handleActivityClose.bind(self))
      .setVisible(1);
  }

  function closeActivity(self) {
    if (self.activity) {
      self.activity.close();
      self.activity = null;
    }
    renderHeader(self);
    self.openActionItem = null;
  }

  function handleActivityClose() {
    var self = this;
    closeActivity(self);
    self.listingController.open();
    self.listingController.setVisible(1);
  }

  function Controller() {
    var self = this;
    var sessionManager = Services.sessionManager;
    sessionManager.addStateChangeListener(handleSessionManagerStateChange.bind(self));
    self.listingController = new ListingController(sessionManager)
      .onActionItemOpen(handleActivityOpen.bind(self));
  }

  Controller.prototype = {
    setVisible: function(visible) {
      selectContainer().setVisible(visible);
      return this;
    },
    open: function() {
      var self = this;
      if (!self.isOpen) {
        self.listingController.open();
        self.isOpen = true;
      }
    },
    close: function() {
      var self = this;
      if (self.isOpen) {
        closeActivity(self);
        self.listingController.close();
        self.isOpen = false;
      }
    }
  }

  return Controller;
});
