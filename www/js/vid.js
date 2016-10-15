// vid.js

define([ "jquery", "utils", "webrtc-adapter" ], function($, u) {

  function Bindable(value) {
    this.listeners = [];
    this.value = value;
  }
  Bindable.prototype = {
    setValue: function(value) {
      this.value = value;
      for (var i = 0; i < this.listeners.length; ++i) {
        this.listeners[i](value);
      }
    },
    getOnChangeFunc: function() {
      var self = this;
      return function(func) {
        self.listeners.push(func);
        func(self.value);
      }
    }
  }

  function newLocalVideoController(localVideo) {
    var startEnabled = new Bindable(true);
    var localStream = new Bindable();

    function start() {
      u.trace('Requesting local stream');
      startEnabled.setValue(false);
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      }).then(function(stream) {
        u.trace('Received local stream');
        localVideo.srcObject = stream;
        localStream.setValue(stream);
      }).catch(function(e) {
        alert('getUserMedia() error: ' + e.name);
      });
    }

    localVideo.addEventListener('loadedmetadata', function() {
      u.trace('Local video videoWidth: ' + this.videoWidth +
        'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    return {
      onChangeStartEnabled: startEnabled.getOnChangeFunc(),
      onChangeLocalStream: localStream.getOnChangeFunc(),
      start: start
    }
  }

  function newRemoteVideoController(remoteVideo) {
    var startTime;
    var sourceStream;
    var pc1, pc2;
    var callEnabled = new Bindable(false);
    var hangupEnabled = new Bindable(false);

    function setSourceStream(_sourceStream) {
      sourceStream = _sourceStream;
      callEnabled.setValue(!!sourceStream);
      hangupEnabled.setValue(false);
    }

    function call() {
      u.trace('Starting call');
      callEnabled.setValue(false);
      hangupEnabled.setValue(true);
      startTime = window.performance.now();
      var videoTracks = sourceStream.getVideoTracks();
      var audioTracks = sourceStream.getAudioTracks();
      if (videoTracks.length > 0) {
        u.trace('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        u.trace('Using audio device: ' + audioTracks[0].label);
      }
      pc1 = new RTCPeerConnection(null);
      u.trace('Created local peer connection object pc1');
      pc1.onicecandidate = function(e) {
        onIceCandidate(pc2, e);
      };
      pc2 = new RTCPeerConnection(null);
      u.trace('Created remote peer connection object pc2');
      pc2.onicecandidate = function(e) {
        onIceCandidate(pc1, e);
      };
      pc1.oniceconnectionstatechange = function(event) {
        u.trace("pc1 ICE state: " + pc1.iceConnectionState + " " + event.toString());
      };
      pc2.oniceconnectionstatechange = function(e) {
        u.trace("pc2 ICE state: " + pc2.iceConnectionState + " " + event.toString());
      };
      pc2.onaddstream = function(event) {
        remoteVideo.srcObject = event.stream;
        u.trace('pc2 received remote stream');
      }

      pc1.addStream(sourceStream);
      u.trace('Added local stream to pc1');

      u.trace('pc1 createOffer start');
      pc1.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      }).then(
        function(desc) {
          u.trace("pc1 createOffer done\n" + desc.sdp);
          gotOffer(desc);
        },
        function(error) {
          u.trace("createOffer error " + error.toString());
        }
      );
    }

    function gotOffer(desc) {
      u.trace('pc1 setLocalDescription start');
      pc1.setLocalDescription(desc).then(
        function() {
          u.trace("pc1 setLocalDescription done");
        },
        function(error) {
          u.trace("pc1 setLocalDescripion error " + error.toString());
        }
      );
      u.trace('pc2 setRemoteDescription start');
      pc2.setRemoteDescription(desc).then(
        function() {
          u.trace("pc2 setRemoteDescription success");
        },
        function(error) {
          u.trace("pc2 setLocalDescripion error " + error.toString());
        }
      );
      // Since the 'remote' side has no media stream we need
      // to pass in the right constraints in order for it to
      // accept the incoming offer of audio and video.
      u.trace('pc2 createAnswer start');
      pc2.createAnswer().then(
        function(desc) {
          u.trace('Answer from pc2:\n' + desc.sdp);
          gotAnswer(desc);
        },
        function(error) {
          u.trace("createAnswer error " + error.toString());
        }
      );
    }

    function gotAnswer(desc) {
      u.trace('pc2 setLocalDescription start');
      pc2.setLocalDescription(desc).then(
        function() {
          u.trace("pc2 setLocalDescription done");
        },
        function(error) {
          u.trace("pc2 setLocalDescription error " + error.toString());
        }
      );
      u.trace('pc1 setRemoteDescription start');
      pc1.setRemoteDescription(desc).then(
        function() {
          u.trace("pc1 setRemoteDescription success");
        },
        function(error) {
          u.trace("pc1 setRemoteDescription error " + error.toString());
        }
      );
    }

    function onIceCandidate(otherPc, event) {
      if (event.candidate) {
        otherPc.addIceCandidate(
          new RTCIceCandidate(event.candidate)
        ).then(
          function() {
            u.trace("addIceCandidate success");
          },
          function(error) {
            u.trace("addIceCandidate error " + error.toString());
          }
        );
        u.trace('ICE candidate: \n' + event.candidate.candidate);
      }
    }

    function hangup() {
      u.trace('Ending call');
      pc1.close();
      pc2.close();
      pc1 = null;
      pc2 = null;
      setHangupEnabled(false);
      setCallEnabled(!!sourceStream);
    }

    remoteVideo.addEventListener('loadedmetadata', function() {
      u.trace('Remote video videoWidth: ' + this.videoWidth +
        'px,  videoHeight: ' + this.videoHeight + 'px');
    });

    remoteVideo.onresize = function() {
      u.trace('Remote video size changed to ' +
        remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
      // We'll use the first onresize callback as an indication that video has started
      // playing out.
      if (startTime) {
        var elapsedTime = window.performance.now() - startTime;
        u.trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
      }
    };

    return {
      setSourceStream: setSourceStream,
      onChangeCallEnabled: callEnabled.getOnChangeFunc(),
      onChangeHangupEnabled: hangupEnabled.getOnChangeFunc(),
      call: call,
      hangup: hangup
    }
  }

  return {
    newLocalVideoController: newLocalVideoController,
    newRemoteVideoController: newRemoteVideoController
  }
});
