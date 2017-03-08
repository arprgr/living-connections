window.onload = function() {

	//initialize video from HTML markup
	var video = document.getElementById("video");
	var video = document.getElementsByTagName('video')[0];
	video.removeAttribute('controls');

	//initialize buttons from HTML markup
	var playButton = document.getElementById("play-pause");
	var muteButton = document.getElementById("mute");
	var fullScreenButton = document.getElementById("full-screen");

	//play-pause button
	playButton.addEventListener("click", function() {
		if(video.paused==true) {
			//play video
			video.play();
			//update button text to pause
			playButton.innerHTML = "Pause";
		} else {
			//pause video
			video.pause();
			//update button text to play
			playButton.innerHTML = "Play";
		}
	});

	//mute button
	muteButton.addEventListener("click", function() {
		if(video.muted==false) {
			//mute video
			video.muted = true;
			//update button text to unmute
			muteButton.innerHTML = "Unmute";
		} else {
			//unmute video
			video.muted = false;
			//update button text to mute
			muteButton.innerHTML = "Mute";
		}
	});

	//full-screen button
	fullScreenButton.addEventListener("click", function() {
		//options based on browser
		if(video.requestFullScreen) {
			video.requestFullScreen;
		} else if(video.mozRequestFullScreen) {
			video.mozRequestFullScreen();
		} else if(video.webkitRequestFullScreen) {
			video.webkitRequestFullScreen();
		}
	});
}