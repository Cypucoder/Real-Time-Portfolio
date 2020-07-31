const btnBackward = document.querySelector('.btn-backward');
const btnExpand = document.querySelector('.btn-expand');
const btnMute = document.querySelector('.btn-mute');
const btnMuteIcon = btnMute.querySelector('.fa');
const btnPlay = document.querySelector('.btn-play');
const btnPlayIcon = btnPlay.querySelector('.fa');
const btnForward = document.querySelector('.btn-forward');
const btnReset = document.querySelector('.btn-reset');
const btnStop = document.querySelector('.btn-stop');
const progressBar = document.querySelector('.progress-bar');
const progressBarFill = document.querySelector('.progress-bar-fill');
const videoElement = document.querySelector('.video-element');

// Toggle full-screen mode
const expandVideo = () => {
  if (videoElement.requestFullscreen) {
    videoElement.requestFullscreen();
  } else if (videoElement.mozRequestFullScreen) {
    // Version for Firefox
    videoElement.mozRequestFullScreen();
  } else if (videoElement.webkitRequestFullscreen) {
    // Version for Chrome and Safari
    videoElement.webkitRequestFullscreen();
  }
}

// Move the video backward for 5 seconds
const moveBackward = () => {
  videoElement.currentTime -= 5;
}

// Move the video forward for 5 seconds
const moveForward = () => {
  videoElement.currentTime += 5;
}

// Mute the video
const muteVideo = () => {
  if (videoElement.muted) {
    videoElement.muted = false;

    btnMuteIcon.classList.remove('fa-volume-up');
    btnMuteIcon.classList.add('fa-volume-off');
  } else {
    videoElement.muted = true;

    btnMuteIcon.classList.remove('fa-volume-off');
    btnMuteIcon.classList.add('fa-volume-up');
  }
}

// Play / Pause the video
const playPauseVideo = () => {
  if (videoElement.paused) {
    videoElement.play();

    btnPlayIcon.classList.remove('fa-play');
    btnPlayIcon.classList.add('fa-pause');
  } else {
    videoElement.pause();

    btnPlayIcon.classList.remove('fa-pause');
    btnPlayIcon.classList.add('fa-play');
  }
}

// Restart the video
const restartVideo = () => {
  videoElement.currentTime = 0;

  btnPlay.removeAttribute('hidden');
  btnReset.setAttribute('hidden', 'true');
}

// Stop the video
const stopVideo = () => {
  videoElement.pause();
  videoElement.currentTime = 0;
  btnPlayIcon.classList.remove('fa-pause');
  btnPlayIcon.classList.add('fa-play');
}

// Update progress bar as the video plays
const updateProgress = () => {
  // Calculate current progress
  let value = (100 / videoElement.duration) * videoElement.currentTime;

  // Update the slider value
  progressBarFill.style.width = value + '%';
}

// Event listeners
btnBackward.addEventListener('click', moveBackward, false);
btnExpand.addEventListener('click', expandVideo, false);
btnMute.addEventListener('click', muteVideo, false);
btnPlay.addEventListener('click', playPauseVideo, false);
btnForward.addEventListener('click', moveForward, false);
btnReset.addEventListener('click', restartVideo, false);
btnStop.addEventListener('click', stopVideo, false);
videoElement.addEventListener('ended', () => {
  btnPlay.setAttribute('hidden', 'true');
  btnReset.removeAttribute('hidden');
}, false);
videoElement.addEventListener('timeupdate', updateProgress, false);