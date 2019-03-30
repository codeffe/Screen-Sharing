function captureScreen(cb) {
    getScreenId(function (error, sourceId, screen_constraints) {
        navigator.mediaDevices.getUserMedia(screen_constraints).then(cb).catch(function(error) {
          console.error('getScreenId error', error);
          alert('Failed to capture your screen. Please check Chrome console logs for further information.');
        });
    });
}
function captureCamera(cb) {
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(cb);
}
function keepStreamActive(stream) {
    var video = document.createElement('video');
    video.muted = true;
    setSrcObject(stream, video);
    video.style.display = 'none';
    (document.body || document.documentElement).appendChild(video);
}
document.getElementById("record").onclick = function() {
captureScreen(function(screen) {
    keepStreamActive(screen);
    captureCamera(function(camera) {
        keepStreamActive(camera);
        screen.width = window.screen.width;
        screen.height = window.screen.height;
        screen.fullcanvas = true;
        $('#record .glossy').html("Stop Recording");
		$('#record').attr('id','stoprecord');
        var recorder = RecordRTC([screen, camera], {
            type: 'video',
            mimeType: 'video/mp4'
        });
        recorder.startRecording();
        document.getElementById("stoprecord").onclick = function() {
			recorder.stopRecording(function() {
				var blob = recorder.getBlob();
                document.querySelector('video').src = URL.createObjectURL(blob);
                document.querySelector('video').muted = false;
                [screen, camera].forEach(function(stream) {
                    stream.getVideoTracks().forEach(function(track) {
                        track.stop();
                    });
                    stream.getAudioTracks().forEach(function(track) {
                        track.stop();
                    });
                })
				    var a = document.createElement("a");
					var url = window.URL.createObjectURL(blob);
					document.getElementById("msgbox").appendChild(a);
					a.href = url;
					a.innerHTML = "Click here to download your screen record";
					a.download = "record.mp4";
					$('#stoprecord').attr('id','record');
					$('#record .glossy').html("Record Screen");
            });
        };
    });
});
};