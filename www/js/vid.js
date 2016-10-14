// vid.js

define([ "jquery", "utils", "webrtc-adapter" ], function($, u, webrtc) {

  function newController() {

    var localVideo, remoteVideo;
    var startTime;
    var localStream;
    var pc1, pc2;
    var startEnabledHandler, callEnabledHandler, hangupEnabledHandler;

    function setLocalVideo($localVideo) {
      localVideo = $localVideo.get();
    }

    function setRemoteVideo($remoteVideo) {
      remoteVideo = $remoteVideo.get();
    }

    function onChangeStartEnabled(handler) {
      startEnabledHandler = handler;
    }

    function onChangeCallEnabled(handler) {
      callEnabledHandler = handler;
    }

    function onChangeHangupEnabled(handler) {
      hangupEnabledHandler = handler;
    }

    function setStartEnabled(enabled) {
      if (startEnabledHandler) startEnabledHandler(enabled);
    }

    function setCallEnabled(enabled) {
      if (callEnabledHandler) callEnabledHandler(enabled);
    }

    function setHangupEnabled(enabled) {
      if (hangupEnabledHandler) hangupEnabledHandler(enabled);
    }

    function init() {
      setStartEnabled(true);
      setCallEnabled(false);
      setHangupEnabled(false);

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
    }

    function getOtherPc(pc) {
      return (pc === pc1) ? pc2 : pc1;
    }

    function setLocalStream(stream) {
      localVideo.srcObject = localStream = stream;
    }

    function setRemoteStream(stream) {
      remoteVideo.srcObject = stream;
    }

    function start() {
      u.trace('Requesting local stream');
      setStartEnabled(false);
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      })
      .then(function(stream) {
        u.trace('Received local stream');
        setLocalStream(stream);
        setCallEnabled(true);
      })
      .catch(function(e) {
        alert('getUserMedia() error: ' + e.name);
      });
    }

    function onIceCandidate(otherPc, event) {
      if (event.candidate) {
        otherPc.addIceCandidate(
          new RTCIceCandidate(event.candidate)
        ).then(
          function() {
            u.trace('addIceCandidate success');
          },
          function(err) {
            u.trace('failed to add ICE Candidate: ' + err.toString());
          }
        );
        u.trace(' ICE candidate: \n' + event.candidate.candidate);
      }
    }

    function call() {
      u.trace('Starting call');
      setCallEnabled(false);
      setHangupEnabled(true);
      startTime = window.performance.now();
      var videoTracks = localStream.getVideoTracks();
      var audioTracks = localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        u.trace('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        u.trace('Using audio device: ' + audioTracks[0].label);
      }

      pc1 = new RTCPeerConnection(null);
      pc1.onicecandidate = function(e) {
        onIceCandidate(pc2, e);
      };
      pc1.oniceconnectionstatechange = function(e) {
        u.trace('pc1 ICE state: ' + pc1.iceConnectionState + ' ' + e);
      };

      pc2 = new RTCPeerConnection(null);
      pc2.onicecandidate = function(e) {
        onIceCandidate(pc1, e);
      };
      pc2.oniceconnectionstatechange = function(e) {
        u.trace('pc2 ICE state: ' + pc2.iceConnectionState + ' ' + e);
      };
      pc2.onaddstream = function(stream) {
        u.trace('pc2 received remote stream');
        setRemoteStream(stream);
      };

      pc1.addStream(localStream);
      u.trace('Added local stream to pc1');

      u.trace('pc1 createOffer start');
      pc1.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      }).then(
        onCreateOfferSuccess,
        onCreateSessionDescriptionError
      );
    }

    function onCreateSessionDescriptionError(error) {
      u.trace('Failed to create session description: ' + error.toString());
    }

    function onCreateOfferSuccess(desc) {
      u.trace('Offer from pc1\n' + desc.sdp);
      u.trace('pc1 setLocalDescription start');
      pc1.setLocalDescription(desc).then(
        function() {
          u.trace('pc1 setLocalDescription complete');
        },
        function(error) {
        }
      );
      u.trace('pc2 setRemoteDescription start');
      pc2.setRemoteDescription(desc).then(
        function() {
          u.trace('pc2 setRemoteDescription complete');
        },
        function(error) {
        }
      );
      u.trace('pc2 createAnswer start');
      // Since the 'remote' side has no media stream we need
      // to pass in the right constraints in order for it to
      // accept the incoming offer of audio and video.
      pc2.createAnswer().then(
        onCreateAnswerSuccess,
        onCreateSessionDescriptionError
      );
    }

    function onCreateAnswerSuccess(desc) {
      u.trace('Answer from pc2:\n' + desc.sdp);
      u.trace('pc2 setLocalDescription start');
      pc2.setLocalDescription(desc).then(
        function() {
          u.trace('pc2 setLocalDescription complete');
        },
        function(error) {
        }
      );
      u.trace('pc1 setRemoteDescription start');
      pc1.setRemoteDescription(desc).then(
        function() {
          u.trace('pc1 setRemoteDescription complete');
        },
        function(error) {
        }
      );
    }

    function hangup() {
      u.trace('Ending call');
      pc1.close();
      pc2.close();
      pc1 = null;
      pc2 = null;
      setHangupEnabled(false);
      setCallEnabled(true);
    }

    return {
      setLocalVideo: setLocalVideo,
      setRemoteVideo: setRemoteVideo,
      init: init,
      start: start,
      call: call,
      hangup: hangup,
      onChangeStartEnabled: onChangeStartEnabled,
      onChangeCallEnabled: onChangeCallEnabled,
      onChangeHangupEnabled: onChangeHangupEnabled
    };
  }

  return {
    newController: newController
  };
});
