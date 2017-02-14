// usereditor.js - User Editor component

define([ "jquery", "services", "activityui", "ui/index" ],
function($,        Services,   Activity,     ui) {

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

    c.defineInitializer(function() {
      var self = this;

      var nameInput;
      var updateButton;

      function showProgress(promise) {
        // TODO: pop up a results window.  TODO: add a timeout.
        updateButton.enabled = false;
        promise.then(function() {
          updateButton.enabled = true;
        }).catch(function(err) {
          updateButton.enabled = true;
          console.log(err);
        });
      }

      nameInput = new ui.TextInput().addPlugin({
        submit: function(name) {
          showProgress(Services.apiService.updateUser(getUserId(), name));
        }
      });
      nameInput.addChangeListener(function() {
        updateButton.enabled = nameInput.valid;
      });
      nameInput.ele.find("input").attr("placeholder", "(not set)");

      var updateButton = ui.Button.create("Update", function() {
        nameInput.submit();
      });

      var underLabel = new ui.Component();

      self.ele
        .append($("<div>")
          .addClass("panel")
          .append($("<div>")
            .append($("<span>").text("Your user name is: ")
            .append(nameInput.container)
            .append(updateButton.container)))
          .append($("<div>")
            .text("This is the name that is shown to other Living Connections users " +
                  "and appears in the invitations that you send."))
          );

      self.nameInput = nameInput;
      self.updateButton = updateButton;
    });

    c.extendPrototype({
      open: function() {
        var self = this;
        self.nameInput.value = getUserName();
        setTimeout(function() {
          self.nameInput.select().focus();
        }, 100);
        return Activity.prototype.open.call(self);
      },
      close: function() {
        var self = this;
        return self;
      },
      exit: function() {
        this.invokePlugin("exit");
      }
    });
  });
});
