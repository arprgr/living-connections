// greeditor.js - new Greeting Editor incorporating new VideoRecorder component

define([ "jquery", "services", "ui/index", "activityui", "waitanim" ],
function($,        Services,   ui,         Activity,      WaitAnim) {

  var videoService = Services.videoService;

  // Component states.

  var STATE_WAITING = "waiting";     // Waiting for I/O.
  var STATE_READY = "ready";         // Camera is on but not recording.  There is no saved video.
  var STATE_RECORDING = "recording"; // Camera is on and recording.
  var STATE_REVIEW = "review";       // Playing back a previously recorded video.
  var STATE_ERROR = "error";         // Something went wrong.
  var STATE_DONE = "done";           // Success.

  function now() {
    return new Date().getTime();
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  var ControlPanel = ui.Carton.defineClass(function(c) {

    c.defineDefaultOptions({
      initialState: STATE_WAITING
    });

    c.defineInitializer(function() {
      var self = this;
      var controller = self.options.controller;

      self.defaultButtons = {};
      function declareDefaultButtonForState(state, button) {
        button.ele.addClass("default");
        self.defaultButtons[state] = button;
      }

      // [Click here] to start recording
      var startButton = ui.Button.create("Click here", function() {
        self.invokePlugin("startRecording");
      });
      declareDefaultButtonForState(STATE_READY, startButton);

      // Recording... [Stop]
      var stopButton = ui.Button.create("Stop", function() {
        self.invokePlugin("stopRecording");
      });
      declareDefaultButtonForState(STATE_RECORDING, stopButton);

      // Review your XXX...  [Send it] or [Re-record it]
      var acceptButton = ui.Button.create("Send it", function() {
        self.invokePlugin("acceptRecording");
      });
      declareDefaultButtonForState(STATE_REVIEW, acceptButton);
      var rejectButton = ui.Button.create("Re-record it", function() {
        self.invokePlugin("rejectRecording");
      });

      // Your XXX has been sent. [OK]
      var closeButton = ui.Button.create("OK", function() {
        self.invokePlugin("exit");
      });
      declareDefaultButtonForState(STATE_DONE, closeButton);

      // Oh no, something went wrong. [Try again]
      var retryButton = ui.Button.create("Try again", function() {
        self.invokePlugin("retry");
      });
      declareDefaultButtonForState(STATE_ERROR, retryButton);

      self.addCompartment(STATE_WAITING, new WaitAnim($("<div>"), {
      }));
      self.addCompartment(STATE_READY, new ui.Component($("<div>")
        .append(startButton.ele)
        .append($("<span>").text(" to start recording."))
      ));
      self.addCompartment(STATE_RECORDING, new ui.Component($("<div>")
        .append($("<span>").text("Recording... "))
        .append(stopButton.ele)
      ));
      self.addCompartment(STATE_REVIEW, new ui.Component($("<div>")
        .append($("<span>").text("Please review your " + self.options.what + "... "))
        .append(acceptButton.ele)
        .append(rejectButton.ele)
      ));
      self.addCompartment(STATE_ERROR, new ui.Component($("<div>")
        .append($("<span>").text("Ugh, something went wrong! " + self.options.what))
      ));
      self.addCompartment(STATE_DONE, new ui.Component($("<div>")
        .append($("<span>").text(capitalize(self.options.what) + " sent! "))
        .append(closeButton.ele)
      ));
    });
  });

  function createController(self) {

    var controller;

    function showState(state) {
      self.controlPanel.show(state);
      var defaultButton = self.controlPanel.defaultButtons[state];
      if (defaultButton) {
        setTimeout(function() {
          defaultButton.focus();
        }, 100);
      }
    }

    function runTransition() {
      // TODO: add timeout.
      self.transitionFunc()
      .then(function() {
        showState(self.targetState);
      })
      .catch(function() {
        self.videoBlob = null;
        showState(STATE_ERROR);
      });
    }

    function toNextState(transitionFunc, targetState) {
      self.transitionFunc = transitionFunc;
      self.targetState = targetState;
      runTransition();
    }

    function openCamera() {
      self.videoBlob = null;
      return videoService.open()
      .then(function(stream) {
        return self.videoComponent.load(stream);
      });
    }

    function showCountdown(text, opacity) {
      self.counter.visible = true;
      self.counter.text = secondsRemaining;
      self.counter.container.css("opacity", (millisRemaining % 1000) / 1000);
    }

    function hideCountdown() {
      self.counter.visible = false;
    }

    function scheduleCountdown() {
      self.countdownTimeout = setTimeout(function() {
        var millisRemaining = self.autoStopTime - now();
        if (millisRemaining <= 0) {
          controller.stopRecording();
        }
        else {
          var secondsRemaining = Math.floor(millisRemaining/1000 + 1);
          var opacity = (millisRemaining % 1000) / 1000;
          if (secondsRemaining <= self.options.countdownStartsAt) {
            showCountdown(secondsRemaining, opacity);
          }
          scheduleCountdown();
        }
      }, 20);
    }

    function showRecording() {
      var promise = $.Deferred();
      self.videoComponent.pause();
      clearTimeout(self.countdownTimeout);
      hideCountdown();
      videoService.stopRecording(function(blob, url) {
        self.videoBlob = blob;
        videoService.close();
        promise.resolve(self.videoComponent.load(url));
      });
      return promise;
    }

    function saveRecording() {
      self.videoComponent.pause();
      var videoBlob = self.videoBlob;
      self.videoBlob = null;
      return Services.apiService.saveVideo(videoBlob)
      .then(function(asset) {
        return self.videoComponent.load(asset.url)
        .then(function() {
          return Services.apiService.saveForm("gre", "cre", {
            assetId: asset.id,
            toUserId: self.actionItem.user.id
          });
        });
      })
    }

    controller = {

      open: function() {
        toNextState(openCamera, STATE_READY);
      },

      startRecording: function() {
        videoService.startRecording();
        showState(STATE_RECORDING);
        self.autoStopTime = now() + (self.options.maxSeconds * 1000);
        scheduleCountdown();
      },

      stopRecording: function() {
        toNextState(showRecording, STATE_REVIEW);
      },

      acceptRecording: function() {
        toNextState(saveRecording, STATE_DONE);
      },

      rejectRecording: function() {
        toNextState(openCamera, STATE_READY);
      },

      retry: function() {
        if (self.transitionFunc) {
          runTransition();
        }
      }
    }
    return controller;
  }

  return Activity.defineClass(function(c) {

    c.defineDefaultOptions({
      what: "videogram",
      maxSeconds: 20,
      countdownStartsAt: 5
    });

    c.defineInitializer(function() {
      var self = this;
      var controller = createController(self);
      var controlPanel = new ControlPanel($("<div>").addClass("controlPanel"), self.options)
        .addPlugin(controller)
        .addPlugin(self);
      var videoComponent = new ui.Video($("<div>").addClass("vid"));
      var counter = new ui.Component($("<span>").addClass("counter"));

      self.ele
        .append($("<div>")
          .addClass("panel")
          .append(controlPanel.ele))
        .append($("<div>")
          .addClass("panel")
          .append($("<div>")
            .addClass("vidrec")
            .append(videoComponent.ele)
          ))

      self.controlPanel = controlPanel;
      self.videoComponent = videoComponent;
      self.counter = counter;
      self.controller = controller;
    });

    c.extendPrototype({

      open: function() {
        this.controlPanel.open();
        this.controller.open();
        return this;
      },

      close: function() {
        videoService.close();
        return this;
      }
    });
  });
});
