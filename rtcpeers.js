var code = `
    window.srPeerConnections = [];

    (function(original) {
        RTCPeerConnection = function() {
            var connection = new original(arguments);
            window.srPeerConnections.push(connection);
            return connection;
        };
        RTCPeerConnection.prototype = original.prototype;
    })(RTCPeerConnection);

    function createRemoteStreamWindowObject() {
        window.srPeerConnections.forEach((pc) => {
            var streams = pc.getRemoteStreams();
            streams.forEach((stream) => {
                var tracks = stream.getTracks();
                if (tracks.length === 2) {
                    window.srRemoteStream = stream;
                }
            });
        });
    }

    function downloadStream(chunks) {
        var blob = new Blob(chunks, {
            type: chunks[0].type
        });
        var url = URL.createObjectURL(blob);
        window.dispatchEvent(new CustomEvent('stadiaRecorder', {
            detail: {
                fn: 'downloadUrl',
                fnArgs: [
                    url
                ]
            }
        }));
        chunks = undefined;
    }

    function startStream() {
        if (!window.srRemoteStream && !window.srRecorder && !window.srChunks) {
            createRemoteStreamWindowObject();
            if (window.srRemoteStream) {
                window.srRecorder = new MediaRecorder(window.srRemoteStream);
                window.srChunks = [];
                window.srRecorder.ondataavailable = (e) => {
                    window.srChunks.push(e.data);
                    if (window.srRecorder.state === "inactive") {
                        downloadStream(window.srChunks);
                        window.srRemoteStream = undefined;
                        window.srRecorder = undefined;
                    }
                };
                window.srRecorder.start();
            } else {
                showNotification('No active stream found');
            }
        } else {
            showNotification('Ongoing stream exists');
        }
    }

    function pauseResumeStream() {
        if (window.srRecorder) {f
            var state = window.srRecorder.state;
            if (state === "recording") window.srRecorder.pause();
            else if (state === "paused") window.srRecorder.resume();
        } else {
            showNotification('Did you start recording?');
        }
    }

    function stopStream() {
        if (window.srRecorder) {
            window.srRecorder.stop();
        } else {
            showNotification('No ongoing stream to stop');
        }
    }

    function showNotification(message) {
        console.log('Stadia Recorder:', message);
        window.dispatchEvent(new CustomEvent('stadiaRecorder', {
            detail: {
                fn: 'showNotification',
                fnArgs: [
                    message
                ]
            }
        }));
    }
`;

var script = document.createElement('script');
script.textContent = code;
(document.head||document.documentElement).appendChild(script);
script.remove();
