// usereditor.js - User Editor component

define([ "jquery", "services", "activityui", "ui/index", "waitanim" ],
function($,        Services,   Activity,     ui,         WaitAnim) {

  var sessionManager = Services.sessionManager;

  function getUser() {
    return sessionManager.user || {};
  }

  function getUserName() {
    return getUser().name || "";
  }

  function getUserId() {
    return getUser().id;
  }

  return Activity.defineClass(function(c) {

    function block(self) {
      self.nameInput.enabled = false;
      self.updateButton.enabled = false;
      self.waitAnim.open();
    }

    function unblock(self) {
      self.nameInput.enabled = true;
      self.updateButton.enabled = self.nameInput.valid && self.nameInput.value != self.nameValue;
      self.waitAnim.close();
    }

    function submit(self) {
      if (self.updateButton.enabled) {
        block(self);
        Services.apiService.updateUser(getUserId(), self.nameValue)
        .then(function() {
          unblock(self);
          sessionManager.refreshNow();
        })
        .catch(function(err) {
          unblock(self);
          console.log(err);
        });
      }
    }

    function createNameInput(self) {
      var nameInput = new ui.TextInput().addPlugin({
        submit: function(name) {
          self.nameValue = name;
          submit(self);
        }
      });
      nameInput.addChangeListener(function() {
        unblock(self);
      });
      nameInput.placeholder = "(not set)";
      return nameInput;
    }

    function createUpdateButton(self) {
      var updateButton = ui.Button.create("Update", function() {
        nameInput.submit();
      });
      updateButton.ele.addClass("default");
      return updateButton;
    }

    c.defineInitializer(function() {
      var self = this;

      var nameInput = createNameInput(self);
      self.nameInput = nameInput;
      
      var updateButton = createUpdateButton(self);
      self.updateButton = updateButton;

      var waitAnim = new WaitAnim($("<span>"), { ndots: 3 });
      self.waitAnim = waitAnim;

      self.ele
        .append($("<div>")
          .addClass("panel")
          .append($("<div>")
            .append($("<span>").text("Your user name is: ")
            .append(nameInput.ele)
            .append(updateButton.ele))
            .append(waitAnim.ele))
          .append($("<div>")
            .text("This is the name that is shown to other Living Connections users " +
                  "and appears in the invitations that you send."))
          );
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        self.nameValue = getUserName();
        self.nameInput.value = getUserName();
        setTimeout(function() {
          self.nameInput.select().focus();
        }, 100);
        return Activity.prototype.open.call(self);
      },
      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });
});
