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

  function newPeerConnection(name, sourceStream) {
    var pc = new RTCPeerConnection(null);
    var stream = new Bindable();
    var peer;

    pc.oniceconnectionstatechange = function() {
      u.trace(name + " ICE state: " + pc.iceConnectionState);
    }
    pc.onaddstream = function(e) {
      u.trace(name + " added stream");
      stream.set(e.stream);
    }
    pc.onicecandidate = function(e) {
      send(e.candidate);
    }

    u.trace("Created " + name);
    if (sourceStream) {
      pc.addStream(sourceStream);
    }

    function setPeer(_peer) {
      peer = _peer;
    }

    function initiateHandshake() {
      note("createOffer", pc.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      }).then(gotOffer));
    }

    function gotOffer(desc) {
      u.trace(desc.sdp);
      setDescription(false, desc);
      if (peer) {
        peer.reciprocateHandshake(desc);
      }
    }

    function reciprocateHandshake(desc) {
      setDescription(true, desc);
      note("createAnswer", pc.createAnswer().then(gotAnswer));
    }

    function gotAnswer(desc) {
      u.trace(desc.sdp);
      setDescription(false, desc);
      peer.completeHandshake(desc);
    }

    function completeHandshake(desc) {
      setDescription(true, desc);
    }

    function setDescription(remote, desc) {
      var fname = "set" + (remote ? "Remote" : "Local") + "Description";
      note(name + " " + fname, pc[fname](desc));
    }

    function send(candidate) {
      if (candidate && peer) {
        // Is this what sends the video segment across?
        peer.receive(candidate);
      }
    }

    function receive(candidate) {
      note("addIceCandidate", pc.addIceCandidate(new RTCIceCandidate(candidate)));
    }

    function note(what, promise) {
      promise.then(
        function() {
          u.trace(what + " done");
        },
        function(error) {
          u.trace(what + " error " + error.toString());
        }
      );
    }

    function close() {
      u.trace(name + " closed");
      pc.close();
      peer = null;
    }

    return {
      onChangeStream: stream.onChangeFunc(),
      setPeer: setPeer,
      initiateHandshake: initiateHandshake,
      reciprocateHandshake: reciprocateHandshake,
      completeHandshake: completeHandshake,
      receive: receive,
      close: close
    }
  }

  function newRemoteVideoController(remoteVideo) {
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
      callEnabled.set(false);
      hangupEnabled.set(true);
      pc1 = newPeerConnection("pc1", sourceStream);
      pc2 = newPeerConnection("pc2");
      pc1.setPeer(pc2);
      pc2.setPeer(pc1);
      pc2.onChangeStream(function(stream) {
        remoteVideo.srcObject = event.stream;
        u.trace('pc2 received remote stream');
      });
      pc1.initiateHandshake(pc2);
    }

    function hangup() {
      pc1.close();
      pc2.close();
      pc1 = null;
      pc2 = null;
      hangupEnabled.set(false);
      callEnabled.set(!!sourceStream);
    }

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
