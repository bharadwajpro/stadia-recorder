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
    }

    function startStream() {
        if (!window.srRemoteStream && !window.srRecorder && !window.srChunks) {
            createRemoteStreamWindowObject();
            if (window.srRemoteStream) {
                window.srRecorder = new MediaRecorder(window.srRemoteStream, getBitrate(window.srRemoteStream));
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
                showNotification('Recording started');
            } else {
                showNotification('No active stream found');
            }
        } else {
            showNotification('Ongoing stream exists');
        }
    }

    function pauseResumeStream() {
        if (window.srRecorder) {
            var state = window.srRecorder.state;
            if (state === "recording") {
                window.srRecorder.pause();
                showNotification('Recording paused');
            }
            else if (state === "paused") {
                window.srRecorder.resume();
                showNotification('Recording resumed');
            }
        } else {
            showNotification('Did you start recording?');
        }
    }

    function stopStream() {
        if (window.srRecorder) {
            window.srRecorder.stop();
            showNotification('Recording stopped');
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

    function getBitrate(ms) {
        var bitrate = 10000000;
        var height = ms.getVideoTracks()[0].getSettings().height;
        if (height <= 720) bitrate *= 1;
        else if (height <= 1080) bitrate *= 2.5;
        else if (height <= 2160) bitrate *= 3.5;
        return {
            bitsPerSecond: bitrate
        };
    }
`;

var script = document.createElement('script');
script.textContent = code;
(document.head||document.documentElement).appendChild(script);
script.remove();
