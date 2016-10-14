// vid.js

define([ "jquery", "utils", "webrtc-adapter" ], function($, u) {

  function newController() {
    var startTime;
    var localVideo;
    var remoteVideo;
    var localStream;
    var pc1;
    var pc2;
    var startEnabledFunc, callEnabledFunc, hangupEnabledFunc;

    function onChangeStartEnabled(_startEnabledFunc) {
      startEnabledFunc = _startEnabledFunc;
    }

    function onChangeCallEnabled(_callEnabledFunc) {
      callEnabledFunc = _callEnabledFunc;
    }

    function onChangeHangupEnabled(_hangupEnabledFunc) {
      hangupEnabledFunc = _hangupEnabledFunc;
    }

    function setStartEnabled(enabled) {
      if (startEnabledFunc) startEnabledFunc(enabled);
    }

    function setCallEnabled(enabled) {
      if (callEnabledFunc) callEnabledFunc(enabled);
    }

    function setHangupEnabled(enabled) {
      if (hangupEnabledFunc) hangupEnabledFunc(enabled);
    }

    function getName(pc) {
      return (pc === pc1) ? 'pc1' : 'pc2';
    }

    function getOtherPc(pc) {
      return (pc === pc1) ? pc2 : pc1;
    }

    function gotStream(stream) {
      u.trace('Received local stream');
      localVideo.srcObject = stream;
      // Add localStream to global scope so it's accessible from the browser console
      window.localStream = localStream = stream;
      setCallEnabled(true);
    }

    function init() {
      setStartEnabled(true);
      setCallEnabled(false);
      setHangupEnabled(false);
    }

    function start() {
      u.trace('Requesting local stream');
      setStartEnabled(false);
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      })
      .then(gotStream)
      .catch(function(e) {
        alert('getUserMedia() error: ' + e.name);
      });
    }

    function call() {
      setCallEnabled(false);
      setHangupEnabled(true);
      u.trace('Starting call');
      startTime = window.performance.now();
      var videoTracks = localStream.getVideoTracks();
      var audioTracks = localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        u.trace('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        u.trace('Using audio device: ' + audioTracks[0].label);
      }
      var servers = null;
      // Add pc1 to global scope so it's accessible from the browser console
      window.pc1 = pc1 = new RTCPeerConnection(servers);
      u.trace('Created local peer connection object pc1');
      pc1.onicecandidate = function(e) {
        onIceCandidate(pc1, e);
      };
      // Add pc2 to global scope so it's accessible from the browser console
      window.pc2 = pc2 = new RTCPeerConnection(servers);
      u.trace('Created remote peer connection object pc2');
      pc2.onicecandidate = function(e) {
        onIceCandidate(pc2, e);
      };
      pc1.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc1, e);
      };
      pc2.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc2, e);
      };
      pc2.onaddstream = gotRemoteStream;

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
          onSetLocalSuccess(pc1);
        },
        onSetSessionDescriptionError
      );
      u.trace('pc2 setRemoteDescription start');
      pc2.setRemoteDescription(desc).then(
        function() {
          onSetRemoteSuccess(pc2);
        },
        onSetSessionDescriptionError
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

    function onSetLocalSuccess(pc) {
      u.trace(getName(pc) + ' setLocalDescription complete');
    }

    function onSetRemoteSuccess(pc) {
      u.trace(getName(pc) + ' setRemoteDescription complete');
    }

    function onSetSessionDescriptionError(error) {
      u.trace('Failed to set session description: ' + error.toString());
    }

    function gotRemoteStream(e) {
      // Add remoteStream to global scope so it's accessible from the browser console
      window.remoteStream = remoteVideo.srcObject = e.stream;
      u.trace('pc2 received remote stream');
    }

    function onCreateAnswerSuccess(desc) {
      u.trace('Answer from pc2:\n' + desc.sdp);
      u.trace('pc2 setLocalDescription start');
      pc2.setLocalDescription(desc).then(
        function() {
          onSetLocalSuccess(pc2);
        },
        onSetSessionDescriptionError
      );
      u.trace('pc1 setRemoteDescription start');
      pc1.setRemoteDescription(desc).then(
        function() {
          onSetRemoteSuccess(pc1);
        },
        onSetSessionDescriptionError
      );
    }

    function onIceCandidate(pc, event) {
      if (event.candidate) {
        getOtherPc(pc).addIceCandidate(
          new RTCIceCandidate(event.candidate)
        ).then(
          function() {
            onAddIceCandidateSuccess(pc);
          },
          function(err) {
            onAddIceCandidateError(pc, err);
          }
        );
        u.trace(getName(pc) + ' ICE candidate: \n' + event.candidate.candidate);
      }
    }

    function onAddIceCandidateSuccess(pc) {
      u.trace(getName(pc) + ' addIceCandidate success');
    }

    function onAddIceCandidateError(pc, error) {
      u.trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
    }

    function onIceStateChange(pc, event) {
      if (pc) {
        u.trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
        console.log('ICE state change event: ', event);
      }
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

    function setLocalVideo(_localVideo) {
      localVideo = _localVideo;

      localVideo.addEventListener('loadedmetadata', function() {
        u.trace('Local video videoWidth: ' + this.videoWidth +
          'px,  videoHeight: ' + this.videoHeight + 'px');
      });
    }

    function setRemoteVideo(_remoteVideo) {
      remoteVideo = _remoteVideo;

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
    }

    return {
      setLocalVideo: setLocalVideo,
      setRemoteVideo: setRemoteVideo,
      onChangeStartEnabled: onChangeStartEnabled,
      onChangeCallEnabled: onChangeCallEnabled,
      onChangeHangupEnabled: onChangeHangupEnabled,
      init: init,
      start: start,
      call: call,
      hangup: hangup
    }
  }

  return {
    newController: newController
  }
});
