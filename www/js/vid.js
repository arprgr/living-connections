// vid.js

define([ "utils", "bindable", "webrtc-adapter" ], function(u, Bindable) {

  function newLocalVideoController() {
    var openEnabled = new Bindable(true);
    var stream = new Bindable();
    var openError = new Bindable();

    function forEachTrack(func) {
      if (stream.get()) {
        var tracks = stream.get().getTracks();
        for (var i = 0; i < tracks.length; ++i) {
          func(tracks[i]);
        }
      }
    }

    function dumpTracks() {
      forEachTrack(function(track) {
        u.trace("Track " + track.id + ": " + track.kind + ", " + track.label);
      });
    }

    function gotStream(_stream) {
      u.trace("localVideo.gotStream");
      stream.set(_stream);
      dumpTracks();
    }

    function gotError(error) {
      openError.set(error);
    }

    function open() {
      u.trace("localVideo.open");
      openEnabled.set(false);
      navigator.mediaDevices.getUserMedia({   // normalized by webrtc-adapter
        audio: false,
        video: true
      })
      .then(gotStream)
      .catch(gotError);
    }

    function close() {
      u.trace("localVideo.close");
      forEachTrack(function(track) {
        track.stop();
      });
      stream.set(null);
      openEnabled.set(true);
    }

    return {
      onChangeOpenEnabled: openEnabled.onChangeFunc(),
      onChangeStream: stream.onChangeFunc(),
      onChangeOpenError: openError.onChangeFunc(),
      open: open,
      close: close
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
      callEnabled.set(!!sourceStream);
      hangupEnabled.set(false);
    }

    function call() {
      u.trace('Starting call');
      callEnabled.set(false);
      hangupEnabled.set(true);
      startTime = window.performance.now();
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
        if (pc1) {
          u.trace("pc1 ICE state: " + pc1.iceConnectionState + " " + event.toString());
        }
      };
      pc2.oniceconnectionstatechange = function(e) {
        if (pc2) {
          u.trace("pc2 ICE state: " + pc2.iceConnectionState + " " + event.toString());
        }
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
      hangupEnabled.set(false);
      callEnabled.set(!!sourceStream);
    }

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
      onChangeCallEnabled: callEnabled.onChangeFunc(),
      onChangeHangupEnabled: hangupEnabled.onChangeFunc(),
      call: call,
      hangup: hangup
    }
  }

  return {
    newLocalVideoController: newLocalVideoController,
    newRemoteVideoController: newRemoteVideoController
  }
});
